import { fail } from "../utils/response.js";

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const msg = result.error.errors.map((e) => e.message).join("; ");
      return fail(res, msg, 400);
    }
    req.body = result.data;
    next();
  };
}
