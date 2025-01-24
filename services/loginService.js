const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Token = require("../utils/token");
const generateRefreshAndAccessToken = require("../utils/generateRefreshAndAccessToken");
const jwt = require("jsonwebtoken");

class LoginService {
  async login(body) {
    try {
      const { email, password } = body;

      const user = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      const { accessToken, refreshToken } = generateRefreshAndAccessToken(
        user.id
      );

      if (!user) {
        return { error: "User not found with this email" }; // Return null if the user is not found
      }

      const token = Token.generateToken({ id: user.id });

      // Update user token
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          token,
        },
      });

      if (user.password === password) {
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
              token,
              workspace: null,
            },
            tokens: {
              accessToken,
              refreshToken,
            },
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

        await prisma.session.create({
          data: {
            userId: user.id,
            refreshToken,
          },
        });

        const { password: userPassword, ...userWithoutPassword } = user;

        return {
          user: {
            ...userWithoutPassword,
            token,
            workspace: { ...workspace, workspaceMembers: workspaceMembersInfo },
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        };
      } else {
        return { error: "Wrong password!" };
      }
    } catch (error) {
      console.log("Error in login service ->", error);
    }
  }

  async refreshToken(req, res) {
    try {
      const { refresh_token } = req.cookies;

      const newAccessToken = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN_SECRET,
        (refreshErr, refreshUser) => {
          if (refreshErr) {
            return res
              .status(403)
              .json({ message: "Invalid or expired refresh token" });
          }

          const newAccessToken = jwt.sign(
            { id: refreshUser.id, username: refreshUser.username }, // Add relevant user data
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30s" } // Short expiry for access tokens
          );

          return { access_token: newAccessToken };
        }
      );

      return newAccessToken;
    } catch (error) {
      console.log("Error while refreshing access token ->", error);
    }
  }
}

module.exports = new LoginService();
