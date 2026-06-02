CREATE OR REPLACE FUNCTION search_listings_fuzzy(p_query text)
RETURNS TABLE (
  listing_id     bigint,
  property_name  text,
  property_price text,
  ward_name      text,
  image_url      text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    pl.listing_id,
    pl.property_name,
    pl.property_price,
    pl.ward_name,
    (
      SELECT it.image_url
      FROM images_table it
      WHERE it.listing_id = pl.listing_id
        AND it.image_url IS NOT NULL
      ORDER BY it.position
      LIMIT 1
    ) AS image_url
  FROM "Property_Listing" pl
  WHERE similarity(pl.property_name, p_query) > 0.1
  ORDER BY similarity(pl.property_name, p_query) DESC
  LIMIT 10;
$$;