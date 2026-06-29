import { Op } from "sequelize";
import Bouquet from "../models/Bouquet.js";
import HttpError from "../helpers/HttpError.js";
import { buildGravatarUrl } from "../helpers/gravatar.js";
import { buildPhotoPublicUrl, moveTempPhotoToPublic } from "../helpers/photoStorage.js";

function parsePagination(query) {
    const page = Math.max(Number.parseInt(query.page ?? query._page ?? "1", 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(query.limit ?? query._per_page ?? "8", 10) || 8, 1), 50);
    const offset = (page - 1) * limit;
    const q = typeof query.q === "string" ? query.q.trim() : "";
    return { page, limit, offset, q };
}

export async function listBouquets(query) {
    const { page, limit, offset, q } = parsePagination(query);
    const where = q
        ? {
              [Op.or]: [
                  { title: { [Op.iLike]: `%${q}%` } },
                  { description: { [Op.iLike]: `%${q}%` } },
              ],
          }
        : {};

    const { rows, count } = await Bouquet.findAndCountAll({
        where,
        limit,
        offset,
        order: [["id", "ASC"]],
    });

    return {
        data: rows,
        items: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit) || 1,
    };
}

export async function getBouquetById(id) {
    const bouquet = await Bouquet.findByPk(id);
    if (!bouquet) throw new HttpError(404, "Not found");
    return bouquet;
}

export async function createBouquet(payload) {
    const photoURL = buildGravatarUrl(payload.title);
    return Bouquet.create({
        title: payload.title,
        description: payload.description,
        price: payload.price,
        favorite: payload.favorite ?? false,
        photoURL,
    });
}

export async function updateBouquet(id, payload) {
    const bouquet = await getBouquetById(id);
    await bouquet.update(payload);
    return bouquet;
}

export async function deleteBouquet(id) {
    const bouquet = await getBouquetById(id);
    await bouquet.destroy();
    return bouquet;
}

export async function updateFavorite(id, favorite) {
    const bouquet = await getBouquetById(id);
    await bouquet.update({ favorite });
    return bouquet;
}

export async function updatePhoto(id, tempFilename) {
    if (!tempFilename) throw new HttpError(400, "Photo file is required");
    const bouquet = await getBouquetById(id);
    const storedName = await moveTempPhotoToPublic(tempFilename);
    const photoURL = buildPhotoPublicUrl(storedName);
    await bouquet.update({ photoURL });
    return bouquet;
}
