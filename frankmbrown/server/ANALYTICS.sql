CREATE OR REPLACE FUNCTION view_page_views() RETURNS TABLE(id bigint, path TEXT, city TEXT, region TEXT, username TEXT, doo TEXT) AS $$
BEGIN
    RETURN QUERY 
    SELECT pv.id, pv.path, ip_loc.city, ip_loc.region, users.user_username username, TO_CHAR(TO_TIMESTAMP(pv.date_viewed), 'Mon DD, YYYY') doo FROM page_view pv JOIN ip_location ip_loc ON 
    pv.ip_id = ip_loc.ip_id LEFT JOIN users ON users.id=pv.ip_id ORDER BY pv.id DESC LIMIT 10000; 
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION page_view_histogram() RETURNS TABLE(page_view_count bigint, path TEXT) AS $$
BEGIN
    RETURN QUERY 
    SELECT count(pv.id) page_view_count, pv.path FROM page_view pv GROUP BY pv.path ORDER BY page_view_count DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION unique_city_regions() RETURNS TABLE(city_region TEXT) AS $$
BEGIN
    RETURN QUERY 
    SELECT DISTINCT city || ', ' || region city_region FROM ip_location;
END;
$$ LANGUAGE plpgsql;

