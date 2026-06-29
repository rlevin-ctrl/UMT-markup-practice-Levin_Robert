import crypto from "node:crypto";

export function buildGravatarUrl(seed = "flora-bouquet") {
    const hash = crypto.createHash("md5").update(seed.trim().toLowerCase()).digest("hex");
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=400`;
}
