import { VariationEssential } from '@c-types/prisma'
import { getVariantMetaData } from '@components/prisma'

export const isNewVariation = async (
  anchorId: number,
  data: VariationEssential
) => {
  const meta = [data.width, data.height, data.x, data.y]

  const variations = await getVariantMetaData(anchorId)
  const exist = variations.some((a) =>
    Object.values(a).map((el, ix) => el === meta[ix])
  )
  return !exist
}
