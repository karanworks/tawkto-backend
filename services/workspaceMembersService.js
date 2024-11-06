const Token = require("../utils/token");
const sendEmail = require("../utils/sendEmail");
const { PrismaClient } = require("@prisma/client");
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
        },
      });

      const workspaceMembersInfo = workspaceMembersIds.map((memberIdRecord) => {
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
          },
        });

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
          href="http://localhost:3000/set-password/token/${token}"
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
  async setPassword(req) {
    const { token, password } = req.body;

    try {
      const user = await prisma.user.findFirst({
        where: {
          verificationToken: token,
        },
      });

      const updateStatus = await prisma.user.update({
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

      const invitationAccepted = await prisma.workspaceMembers.update({
        where: {
          id: workspaceMember.id,
        },
        data: {
          invitationAccepted: true,
        },
      });

      return user;
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
