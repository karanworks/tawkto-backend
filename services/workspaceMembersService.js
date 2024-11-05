const Token = require("../utils/token");
const sendEmail = require("../utils/sendEmail");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class WorkspaceMembersService {
  async inviteMember(req) {
    try {
      const { name, email, role, workspaceId } = req.body;

      const memberExist = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (memberExist) {
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
              <a href="#" 
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
    console.log("SET PASSWORD BODY ->", req.body);

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

      return user;
    } catch (error) {
      console.log("ERROR ->", error);

      throw new Error("Error while inviting member ->", error);
    }
  }
}

module.exports = new WorkspaceMembersService();
