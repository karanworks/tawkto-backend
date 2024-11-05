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

    if (!user) {
      return null; // Return null if the user is not found
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

    // Find workspace member entry
    const workspaceMember = await prisma.workspaceMembers.findFirst({
      where: {
        memberId: user.id,
      },
    });

    // If no workspace member entry is found, return user info without workspace details
    if (!workspaceMember) {
      const { password: userPassword, ...userWithoutPassword } = user;
      return { ...userWithoutPassword, token, workspace: null };
    }

    // Find workspace details if the user is a member
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

    if (user.password === password) {
      const { password: userPassword, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        token,
        workspace: { ...workspace, workspaceMembers: workspaceMembersInfo },
      };
    } else {
      return null;
    }
  }
}

module.exports = new LoginService();
