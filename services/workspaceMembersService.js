const Token = require("../utils/token");
const sendEmail = require("../utils/sendEmail");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class WorkspaceMembersService {
  async inviteMember(body) {
    const { name, email, password } = body;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
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

    const { password: userPassword, ...userWithoutpassword } = user;

    await sendEmail(
      email,
      "You have been invited to join tawkto",
      `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h4 style="font-weight: bold; color: #2c3e50;">Hey,</h4>
        <h6>
          You have been invited to join <strong style="font-weight: bold; color: #2980b9;">tawkto</strong>. Please click the link below to verify your email.
        </h6>
        <div style="margin-top: 20px; text-align: center;">
          <a href="http://localhost:3010/api/verify-email?token=${token}" 
             style="display: inline-block; padding: 12px 20px; background-color: #2980b9; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;"
             target="_blank">
             Verify Email
          </a>
        </div>
        <p style="margin-top: 30px;">If you didn't request this invitation, please ignore this email.</p>
      </div>
      `
    );

    return userWithoutpassword;
  }
}

module.exports = new WorkspaceMembersService();
