const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Token = require("../utils/token");
class LoginService {
  async login(body) {
    const { email, password } = body;

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    const token = Token.generateToken({ id: user.id });

    // update user token
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        token,
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

    const workspaceMembersIds = await prisma.workspaceMembers.findMany({
      where: {
        workspaceId: workspace.id,
      },
    });

    const workspaceMembers = await prisma.user.findMany({
      where: {
        id: {
          in: workspaceMembersIds.map((member) => member.memberId),
          not: user.id,
        },
      },
    });

    if (user.password === password) {
      const { password: userPassword, ...userWithoutpassword } = user;
      return {
        ...userWithoutpassword,
        token,
        workspace: { ...workspace, workspaceMembers },
      };
    } else {
      return null;
    }
  }
}

module.exports = new LoginService();
