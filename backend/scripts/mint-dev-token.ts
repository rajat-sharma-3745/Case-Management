import { signRoleToken, type Role } from "../src/auth/jwt.js";

function parseRole(arg: string | undefined): Role {
  if (arg === "admin" || arg === "intern") {
    return arg;
  }
  console.error('Usage: tsx scripts/mint-dev-token.ts <admin|intern>');
  process.exit(1);
}

const role = parseRole(process.argv[2]);
const token = signRoleToken(role);
console.log(token);
console.error('Use header: Authorization: Bearer <token>');
