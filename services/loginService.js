const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const generateAccessToken = require("../utils/generateAccessToken");
const jwt = require("jsonwebtoken");

class LoginService {
  async login(body) {
    try {
      const { email, password } = body;

      console.log("LOGIN API GOT TRIGGERED ->", email, password);

      const user = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      console.log("REUQEST CAUGHT IN LOGIN SERVICE ->", user);

      if (!user) {
        console.log("VERIFY EMAIL CONDITION TRIGGERED");

        return { error: "User not found with this email" }; // Return null if the user is not found
      }

      if (user.password === password) {
        const { accessToken } = generateAccessToken(user.id);

        if (!user.isVerified) {
          return { error: "Please verify your email!" };
        }

        // Find workspace member entry
        const workspaceMember = await prisma.workspaceMembers.findFirst({
          where: {
            memberId: user.id,
          },
        });

        // If no workspace member entry is found, return user info without workspace details
        if (!workspaceMember) {
          const { password: userPassword, ...userWithoutPassword } = user;

          return {
            user: {
              ...userWithoutPassword,
              workspace: null,
            },
            accessToken,
          };
        }

        // Find workspace details if the user is a member
        const workspace = await prisma.workspace.findFirst({
          where: {
            id: workspaceMember.workspaceId,
          },
        });

        let workspaceMembersInfo;

        if (workspace) {
          const workspaceMembersIds = await prisma.workspaceMembers.findMany({
            where: {
              workspaceId: workspace.id,
            },
          });

          const workspaceMembers = await prisma.user.findMany({
            where: {
              id: {
                in: workspaceMembersIds.map((member) => member.memberId),
              },
            },
          });

          workspaceMembersInfo = workspaceMembersIds.map((memberIdRecord) => {
            const userInfo = workspaceMembers.find(
              (user) => user.id === memberIdRecord.memberId
            );
            return {
              invitationAccepted: memberIdRecord.invitationAccepted,
              name: userInfo.name,
              email: userInfo.email,
              roleId: userInfo.roleId,
            };
          });
        }

        const { password: userPassword, ...userWithoutPassword } = user;

        return {
          user: {
            ...userWithoutPassword,
            workspace: { ...workspace, workspaceMembers: workspaceMembersInfo },
          },
          accessToken,
        };
      } else {
        return { error: "Wrong password!" };
      }
    } catch (error) {
      console.log("Error in login service ->", error);
    }
  }

  // async refreshToken(req, res) {
  //   try {
  //     const { refresh_token } = req.cookies;

  //     const newAccessToken = jwt.verify(
  //       refresh_token,
  //       process.env.REFRESH_TOKEN_SECRET,
  //       (refreshErr, refreshUser) => {
  //         if (refreshErr) {
  //           return res
  //             .status(403)
  //             .json({ message: "Invalid or expired refresh token" });
  //         }

  //         const newAccessToken = jwt.sign(
  //           { id: refreshUser.id, username: refreshUser.username }, // Add relevant user data
  //           process.env.ACCESS_TOKEN_SECRET,
  //           { expiresIn: "30s" } // Short expiry for access tokens
  //         );

  //         return { access_token: newAccessToken };
  //       }
  //     );

  //     return newAccessToken;
  //   } catch (error) {
  //     console.log("Error while refreshing access token ->", error);
  //   }
  // }
}

module.exports = new LoginService();
