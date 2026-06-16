const { User, Role } = require("../models/index");
const { AppError } = require("shared");

class UserRepository {
  // add role as "USER to be default"
  async create(data, roleName = "USER") {
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) throw new AppError("Invalid role name.", 404);
    const user = await User.create(data);
    await user.addRole(role);
    return user;
  }

  async assignRole(email, roleName) {
    const user = await User.findOne({
      where: { email },
    });
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) throw new AppError("Invalid role name.", 404);
    await user.addRole(role);
    return true;
  }

  async updateRole(email, roleName) {
    const user = await User.findOne({
      where: { email },
    });
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) throw new AppError("Invalid role name.", 404);
    await user.setRoles([role]);
    return true;
  }

  async fetch(id) {
    const response = await User.findByPk(id, {
      include: { model: Role, as: "roles", attributes: ["name"] },
    });
    return response;
  }

  async fetchByEmail(email) {
    const user = await User.findOne({
      where: { email },
      include: {
        model: Role,
        as: "roles",
        attributes: ["name"],
      },
    });
    return user;
  }

  async fetchAll() {
    const response = await User.findAll({
      attributes: { exclude: ['password'] },
      include: {
        model: Role,
        as: "roles",
        attributes: ["name"],
      },
    });
    return response;
  }

  async update(id, data) {
    await User.update(data, {
      where: {
        id: id,
      },
      individualHooks: true,
    });
    return true;
  }

  async destroy(id) {
    await User.destroy({ where: { id } });
    return true;
  }
}

module.exports = UserRepository;
