const { User, Role } = require("../models/index");

class UserRepository {
  // add role as "USER to be default"
  async create(data, roleName = "USER") {
    try {
      const user = await User.create(data);
      const role = await Role.findOne({ where: { name: roleName } });
      if (!role) throw new Error("Invalid role name.");
      await user.addRole(role);
      return user;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }
  async assignRole(email, roleName) {
    try {
      const user = await User.findOne({
        where: { email },
      });
      const role = await Role.findOne({ where: { name: roleName } });
      if (!role) throw new Error("Invalid role name.");
      await user.addRole(role);
      return true;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }

  async updateRole(email, roleName) {
    try {
      const user = await User.findOne({
        where: { email },
      });
      const role = await Role.findOne({ where: { name: roleName } });
      if (!role) throw new Error("Invalid role name.");
      await user.setRoles([role]);
      return true;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }

  async fetch(id) {
    try {
      const response = await User.findByPk(id, {
        include: { model: Role, as: "roles", attributes: ["name"] },
      });
      return response;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }

  async fetchByEmail(email) {
    try {
      const user = await User.findOne({
        where: { email },
        include: {
          model: Role,
          as: "roles",
          attributes: ["name"],
        },
      });
      return user;
    } catch (error) {
      console.log("Something went wrong in the repository layer");
      throw error;
    }
  }

  async update(id, data) {
    try {
      await User.update(data, {
        where: {
          id: id,
        },
        individualHooks: true,
      });
      return true;
    } catch (error) {
      console.log("Something went wrong in the repository layer.");
      throw error;
    }
  }

  async destroy(id) {
    try {
      await User.destroy({ where: { id } });
      return true;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }
}

module.exports = UserRepository;
