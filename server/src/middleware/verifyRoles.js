const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.roles)
      return res.status(401).json({ message: "No roles assigned to user" });

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole)
      return res
        .status(403)
        .json({ message: "Access Denied. Insufficient role." });

    next();
  };
};

export default verifyRoles;
