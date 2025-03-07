const Token = require("../utils/token");
const sendEmail = require("../utils/sendEmail");
const { PrismaClient } = require("@prisma/client");
const generateAccessToken = require("../utils/generateAccessToken");
const prisma = new PrismaClient();

class WorkspaceMembersService {
  async workspaceMembers(req) {
    const { workspaceId } = req.params;

    try {
      const workspaceMembersIds = await prisma.workspaceMembers.findMany({
        where: {
          workspaceId: workspaceId,
        },
      });

      const workspaceMembers = await prisma.user.findMany({
        where: {
          id: {
            in: workspaceMembersIds.map((member) => member.memberId),
          },
          status: 1,
        },
      });

      console.log("WORKSPACE MEMBERS ->", workspaceMembers);

      const workspaceMembersInfo = workspaceMembersIds
        .map((memberIdRecord) => {
          const userInfo = workspaceMembers.find(
            (user) => user.id === memberIdRecord.memberId && user.status === 1
          );

          if (userInfo) {
            return {
              id: memberIdRecord.memberId,
              invitationAccepted: memberIdRecord.invitationAccepted,
              name: userInfo.name,
              email: userInfo.email,
              roleId: userInfo.roleId,
            };
          } else {
            return null;
          }
        })
        .filter((member) => member !== null);

      return workspaceMembersInfo;
    } catch (error) {
      console.log("ERROR WHILE FETCHING WORKSPACE MEMBERS ->", error);

      throw new Error("Error while fetching workspace members ->", error);
    }
  }

  async inviteMember(req) {
    try {
      const { name, email, role, workspaceId } = req.body;

      const memberExist = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (memberExist) {
        // assign workspace

        await prisma.workspaceMembers.create({
          data: {
            workspaceId,
            memberId: memberExist.id,
          },
        });

        sendEmail(
          email,
          "You have been invited to join workspace",
          `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h4 style="font-weight: bold; color: #2c3e50;">Hey,</h4>
            <h6>
              You have been invited to join <strong style="font-weight: bold; color: #2980b9;">Workspace</strong>.
            </h6>
            <div style="margin-top: 20px; text-align: center;">
              <a href="http://localhost:3010/api/join/${memberExist.id}/workspace/${workspaceId}" 
                 style="display: inline-block; padding: 12px 20px; background-color: #2980b9; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;"
                 target="_blank">
                 Join workspace
              </a>
            </div>
            <p style="margin-top: 30px;">If you didn't request this invitation, please ignore this email.</p>
          </div>
          `
        );

        return memberExist;
      } else {
        const matchingRole = await prisma.role.findFirst({
          where: {
            name: role,
          },
        });

        const user = await prisma.user.create({
          data: {
            name,
            email,
            roleId: matchingRole.id,
            // isTourCompleted: true,
          },
        });

        console.log("INVITED THIS USER ->", user);

        const token = Token.generateToken({ id: user.id });

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            verificationToken: token,
          },
        });

        // assign workspace
        await prisma.workspaceMembers.create({
          data: {
            workspaceId,
            memberId: user.id,
          },
        });

        const CLIENT_URL =
          process.env.NODE_ENV === "production"
            ? process.env.CLIENT_PROD_URL
            : process.env.CLIENT_DEV_URL;

        sendEmail(
          email,
          "You have been invited to join workspace",
          `
         <div style="color: #333; line-height: 1.6">
         <p style="font-size: medium;">Hey there, </p>
     
      <p style="font-size: medium;">
        You have been invited to join
        <strong style="font-weight: bold; color: #2980b9">Workspace</strong>.
      </p>
      <div style="margin-top: 20px; text-align: center">
        <a
          href="https://ascent-bpo.com/set-password/token/${token}"
          style="
            display: inline-block;
            padding: 12px 20px;
            background-color: #2980b9;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          "
          target="_blank"
        >
          Set your password
        </a>
      </div>
      <p style="margin-top: 30px">
        If you didn't request this invitation, please ignore this email.
      </p>
    </div>
          `
        );

        return user;
      }
    } catch (error) {
      console.log("ERROR ->", error);

      throw new Error("Error while inviting member ->", error);
    }
  }
  async updateMember(req) {
    const { userId } = req.params;
    const { name, email, role } = req.body;

    try {
      const matchingRole = await prisma.role.findFirst({
        where: {
          name: role,
        },
      });

      const invitation = await prisma.workspaceMembers.findFirst({
        where: {
          memberId: userId,
        },
      });

      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name,
          email,
          roleId: matchingRole.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          roleId: true,
        },
      });

      return {
        user: { ...user, invitationAccepted: invitation.invitationAccepted },
        error: null,
      };
    } catch (error) {
      console.log("ERROR WHILE FETCHING WORKSPACE MEMBERS ->", error);

      throw new Error("Error while fetching workspace members ->", error);
    }
  }
  async setPassword(req) {
    const { token, password } = req.body;

    try {
      const user = await prisma.user.findFirst({
        where: {
          verificationToken: token,
        },
      });

      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password,
          isVerified: true,
          verificationToken: null,
        },
      });

      const workspaceMember = await prisma.workspaceMembers.findFirst({
        where: {
          memberId: user.id,
        },
      });

      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceMember.workspaceId,
        },
      });

      await prisma.workspaceMembers.update({
        where: {
          id: workspaceMember.id,
        },
        data: {
          invitationAccepted: true,
        },
      });

      const { accessToken } = generateAccessToken(user.id);
      const { password: userPassword, ...userWithoutPassword } = updatedUser;

      return { ...userWithoutPassword, workspace, accessToken };
    } catch (error) {
      console.log("ERROR ->", error);

      throw new Error("Error while inviting member ->", error);
    }
  }
  async joinWorkspace(req) {
    const { userId, workspaceId } = req.params;

    try {
      const workspaceMember = await prisma.workspaceMembers.findFirst({
        where: { memberId: userId, workspaceId },
      });

      await prisma.workspaceMembers.update({
        where: {
          id: workspaceMember.id,
        },
        data: {
          invitationAccepted: true,
        },
      });

      return true;
    } catch (error) {
      console.log("ERROR WHILE JOINING WORKSPACE->", error);

      throw new Error("Error while joining workspace ->", error);
    }
  }
}

module.exports = new WorkspaceMembersService();
