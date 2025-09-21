
-- https://image.storething.org/frankmbrown/create_annotation.png
-- https://image.storething.org/frankmbrown/create_blog.png
-- https://image.storething.org/frankmbrown/create_comment.png
-- https://image.storething.org/frankmbrown/create_daily_reading.png
-- https://image.storething.org/frankmbrown/create_idea.png
-- https://image.storething.org/frankmbrown/create_jupyter_notebook.png
-- https://image.storething.org/frankmbrown/create_link.png
-- https://image.storething.org/frankmbrown/create_markdown_note.png
-- https://image.storething.org/frankmbrown/create_note.png
-- https://image.storething.org/frankmbrown/create_project.png
-- https://image.storething.org/frankmbrown/create_quote.png
-- https://image.storething.org/frankmbrown/create_stream_consciousness.png
-- https://image.storething.org/frankmbrown/create_tex_note.png
-- https://image.storething.org/frankmbrown/project_update.png
-- https://image.storething.org/frankmbrown/update_blog.png
-- https://image.storething.org/frankmbrown/update_idea.png
-- https://image.storething.org/frankmbrown/update_note.png

-- 1
DROP TABLE IF EXISTS shown_notifications;
DROP TABLE IF EXISTS firebase_tokens;
DROP TABLE IF EXISTS notification_preferences_ip;
DROP TABLE IF EXISTS notification_preferences_user;
DROP TABLE IF EXISTS pushed_notifications;
DROP TABLE IF EXISTS notifications;
DROP TYPE notification_topic;

CREATE TYPE notification_topic AS ENUM ('create_annotation', 'create_note', 'update_note', 'create_blog', 'update_blog', 'create_idea', 'update_idea', 'create_comment', 'create_jupyter_notebook', 'create_markdown_note', 'create_stream_consciousness', 'create_daily_reading', 'create_tex_note', 'create_link', 'create_quote', 'create_project', 'project_update', 'create_survey', 'create_goodreads', 'create_letterboxd', 'create_game', 'create_3d_design', 'create_electronics' );


-- create_project and project_update need to be inserted manually, keep in mind that the icon image should be 96x96 and the image should be icon image

-- 2

CREATE TABLE firebase_tokens (
    id serial PRIMARY KEY,
    ip_id integer NOT NULL REFERENCES ip_info(id) ON DELETE CASCADE,
    user_id integer REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    UNIQUE(ip_id)
);
CREATE INDEX ON firebase_tokens USING BTREE (ip_id);
CREATE INDEX ON firebase_tokens USING BTREE (user_id);

CREATE TABLE notification_preferences_ip (
    id serial PRIMARY KEY,
    ip_id integer NOT NULL REFERENCES ip_info(id) ON DELETE CASCADE,
    create_annotation BOOLEAN not null DEFAULT true,
    create_note BOOLEAN not null DEFAULT true,
    update_note BOOLEAN not null DEFAULT true,
    create_blog BOOLEAN not null DEFAULT true,
    update_blog BOOLEAN not null DEFAULT true,
    create_idea BOOLEAN not null DEFAULT true,
    update_idea BOOLEAN not null DEFAULT true,
    create_comment BOOLEAN not null DEFAULT true,
    create_jupyter_notebook BOOLEAN not null DEFAULT true,
    create_markdown_note BOOLEAN not null DEFAULT true,
    create_stream_consciousness BOOLEAN not null DEFAULT true,
    create_daily_reading BOOLEAN not null DEFAULT true,
    create_tex_note BOOLEAN not null DEFAULT true,
    create_link BOOLEAN NOT NULL DEFAULT true, 
    create_quote BOOLEAN NOT NULL DEFAULT true, 
    create_project BOOLEAN NOT NULL DEFAULT true,
    project_update BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX ON notification_preferences_ip USING BTREE (ip_id);
INSERT INTO notification_preferences_ip (ip_id) SELECT id ip_id FROM ip_info;

CREATE TABLE notification_preferences_user (
    id serial PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    create_annotation BOOLEAN not null DEFAULT true,
    create_note BOOLEAN not null DEFAULT true,
    update_note BOOLEAN not null DEFAULT true,
    create_blog BOOLEAN not null DEFAULT true,
    update_blog BOOLEAN not null DEFAULT true,
    create_idea BOOLEAN not null DEFAULT true,
    update_idea BOOLEAN not null DEFAULT true,
    create_comment BOOLEAN not null DEFAULT true,
    create_jupyter_notebook BOOLEAN not null DEFAULT true,
    create_markdown_note BOOLEAN not null DEFAULT true,
    create_stream_consciousness BOOLEAN not null DEFAULT true,
    create_daily_reading BOOLEAN not null DEFAULT true,
    create_tex_note BOOLEAN not null DEFAULT true,
    create_link BOOLEAN NOT NULL DEFAULT true, 
    create_quote BOOLEAN NOT NULL DEFAULT true, 
    create_project BOOLEAN NOT NULL DEFAULT true,
    project_update BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX ON notification_preferences_user USING BTREE (user_id);
INSERT INTO notification_preferences_user (user_id) SELECT id user_id FROM users;

ALTER TABLE notification_preferences_ip ADD COLUMN create_survey boolean NOT NULL DEFAULT true, ADD COLUMN create_goodreads boolean NOT NULL DEFAULT true, ADD COLUMN create_letterboxd boolean NOT NULL DEFAULT true, ADD COLUMN create_game boolean NOT NULL DEFAULT true, ADD COLUMN create_3d_design boolean NOT NULL DEFAULT true;
ALTER TABLE notification_preferences_user ADD COLUMN create_survey boolean NOT NULL DEFAULT true, ADD COLUMN create_goodreads boolean NOT NULL DEFAULT true, ADD COLUMN create_letterboxd boolean NOT NULL DEFAULT true, ADD COLUMN create_game boolean NOT NULL DEFAULT true, ADD COLUMN create_3d_design boolean NOT NULL DEFAULT true;


-- INSERT INTO notifications (topic,title,body,icon,image,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_image,var_link,var_date_created);

CREATE TABLE notifications (
    id serial PRIMARY KEY,
    topic notification_topic NOT NULL,
    badge TEXT NOT NULL DEFAULT 'https://cdn.storething.org/frankmbrown/asset/96x96.png',
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    icon TEXT NOT NULL,
    image TEXT,
    renotify boolean NOT NULL DEFAULT TRUE,
    require_interaction boolean NOT NULL default TRUE,
    silent boolean NOT NULL DEFAULT FALSE,
    tag uuid NOT NULL DEFAULT gen_random_uuid(),
    link TEXT NOT NULL,
    date_created bigint NOT NULL,
    sent_notification boolean DEFAULT FALSE
);
CREATE INDEX ON notifications USING HASH (topic);

-- CREATE TABLE pushed_notifications (
--     id serial PRIMARY KEY,
--     notification_id integer NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
--     token_id integer NOT NULL,
--     date_pushed bigint NOT NULL
-- );
-- CREATE INDEX ON pushed_notifications USING BTREE (notification_id);
-- CREATE INDEX ON pushed_notifications USING BTREE (token_id);

CREATE TABLE shown_notifications (
    id serial PRIMARY KEY,
    notification_id integer NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    token_id integer NOT NULL REFERENCES firebase_tokens(id) ON DELETE CASCADE, 
    date_shown bigint NOT NULL,
    UNIQUE (notification_id,token_id)
);  
CREATE INDEX ON shown_notifications USING BTREE (notification_id);
CREATE INDEX ON shown_notifications USING BTREE (token_id);

--------------------- TRIGGERS - 3
CREATE OR REPLACE FUNCTION on_create_note_function() RETURNS TRIGGER AS $$
DECLARE 
    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_image notifications.image%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN 
    -- Topic
    SELECT 'create_note' INTO var_topic;
    -- Icon
    SELECT 'https://image.storething.org/frankmbrown/create_note.png' INTO var_icon;
    -- Date Created
    SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;
    -- If active_v NOT NULL, then note was created
    IF NEW.active_v IS NOT NULL THEN 
        SELECT 'New Note: ' || NEW.title, description, regexp_replace(NEW.image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/note/' || NEW.id::text || '/' || NEW.title INTO var_title, var_body, var_image, var_link;  

        INSERT INTO notifications (topic,title,body,icon,image,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_image,var_link,var_date_created);
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION on_create_blog_function() RETURNS TRIGGER AS $$
DECLARE 
    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_image notifications.image%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN 
    SELECT 'create_blog' INTO var_topic;
    SELECT 'https://image.storething.org/frankmbrown/create_blog.png' INTO var_icon;
    SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;
    
    IF NEW.active_v IS NOT NULL THEN 
        SELECT 'New Blog Post: ' || NEW.title, NEW.description, regexp_replace(NEW.image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/idea/' || NEW.id::text || '/' || NEW.title INTO var_title, var_body, var_image, var_link;  
        INSERT INTO notifications (topic,title,body,icon,image,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_image,var_link,var_date_created);
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION on_create_idea_function() RETURNS TRIGGER AS $$
DECLARE 
    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_image notifications.image%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN 
    SELECT 'create_idea' INTO var_topic;
    SELECT 'https://image.storething.org/frankmbrown/create_idea.png' INTO var_icon;
    SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;
    
    IF NEW.active_v IS NOT NULL THEN 
        SELECT 'New Idea: ' || NEW.title, NEW.description, regexp_replace(NEW.image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/idea/' || NEW.id::text || '/' || NEW.title INTO var_title, var_body, var_image, var_link;  
        INSERT INTO notifications (topic,title,body,icon,image,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_image,var_link,var_date_created);
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION on_update_note_function()  RETURNS TRIGGER AS $$
DECLARE 
    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_image notifications.image%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN 
    SELECT 'update_note' INTO var_topic;
    SELECT 'https://image.storething.org/frankmbrown/update_note.png' INTO var_icon;
    SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;
    
    IF (NEW.last_edited > OLD.last_edited AND NEW.active_v IS NOT NULL) OR (NEW.active_v<>OLD.active_v AND NEW.active_v IS NOT NULL) THEN 
        SELECT 'Updated Note: ' || NEW.title, NEW.description, regexp_replace(NEW.image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/note/' || NEW.id::text || '/' || NEW.title INTO var_title, var_body, var_image, var_link; 

        INSERT INTO notifications (topic,title,body,icon,image,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_image,var_link,var_date_created);
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_update_blog_function()  RETURNS TRIGGER AS $$
DECLARE
    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_image notifications.image%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN 
    SELECT 'update_blog' INTO var_topic;
    SELECT 'https://image.storething.org/frankmbrown/update_blog.png' INTO var_icon;
    SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;

    IF (NEW.last_edited > OLD.last_edited AND NEW.active_v IS NOT NULL) OR (NEW.active_v<>OLD.active_v AND NEW.active_v IS NOT NULL) THEN 
        SELECT 'Updated Blog: ' || NEW.title, NEW.description, regexp_replace(NEW.image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/blog/' || NEW.id::text || '/' || NEW.title INTO var_title, var_body, var_image, var_link;  

        INSERT INTO notifications (topic,title,body,icon,image,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_image,var_link,var_date_created);
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_update_idea_function()  RETURNS TRIGGER AS $$
DECLARE 
    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_image notifications.image%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN 
    SELECT 'update_idea' INTO var_topic;
    SELECT 'https://image.storething.org/frankmbrown/update_idea.png' INTO var_icon;
    SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;

    IF (NEW.last_edited > OLD.last_edited AND NEW.active_v IS NOT NULL) OR (NEW.active_v<>OLD.active_v AND NEW.active_v IS NOT NULL) THEN 
        SELECT 'Updated Idea: ' || NEW.title, NEW.description, regexp_replace(NEW.image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/idea/' || NEW.id::text || '/' || NEW.title INTO var_title, var_body, var_image, var_link;  
        INSERT INTO notifications (topic,title,body,icon,image,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_image,var_link,var_date_created);
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_create_annotation_function()  RETURNS TRIGGER AS $$
DECLARE
    var_username users.user_username%TYPE;
    var_note_id annotations.note_id%TYPE;
    var_blog_id annotations.blog_id%TYPE;
    var_idea_id annotations.idea_id%TYPE;
    var_wikipedia_id annotations.wikipedia_id%TYPE;

    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_image notifications.image%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN
    SELECT 'create_annotation' INTO var_topic;
    SELECT 'https://image.storething.org/frankmbrown/create_annotation.png' INTO var_icon;
    SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;

    SELECT users.user_username, annotations.note_id, annotations.blog_id, annotations.idea_id, annotations.wikipedia_id 
    INTO var_username, var_note_id, var_blog_id, var_idea_id, var_wikipedia_id
    FROM annotations  
    JOIN users
    ON users.id=annotations.user_id
    WHERE annotations.id=NEW.annotation_id;

    SELECT var_username || ': ' || NEW.document INTO var_body;
    
    IF var_note_id IS NOT NULL THEN 
        SELECT 'https://image.storething.org/frankmbrown/create_note.png' INTO var_icon;
        SELECT 'New Annotation on ' || title, regexp_replace(image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/note/' || id::text || '/' || title INTO var_title, var_image, var_link FROM note WHERE var_note_id=note.id; 
    ELSIF var_blog_id IS NOT NULL THEN 
        SELECT 'https://image.storething.org/frankmbrown/create_blog.png' INTO var_icon;
        SELECT 'New Annotation on ' || title, regexp_replace(image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/blog/' || id::text || '/' || title INTO var_title, var_image, var_link FROM blog WHERE var_blog_id=blog.id; 
    ELSIF var_idea_id IS NOT NULL THEN 
        SELECT 'https://image.storething.org/frankmbrown/create_idea.png' INTO var_icon;
        SELECT 'New Annotation on ' || title, regexp_replace(image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/idea/' || id::text || '/' || title INTO var_title, var_image, var_link FROM idea WHERE var_idea_id=idea.id; 
    ELSIF var_wikipedia_id IS NOT NULL THEN
        SELECT 'https://image.storething.org/frankmbrown/create_daily_reading.png' INTO var_icon;
        SELECT 'New Annotation on ' || topic_name, regexp_replace(topic_image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/daily-reading/' || id::text || '/' || topic_name INTO var_title, var_image, var_link FROM wikipedia WHERE var_wikipedia_id=wikipedia.id;
    ELSE
        RAISE EXCEPTION 'Unable to find what kind of article the annotation was posted on.';
    END IF;

    INSERT INTO notifications (topic,title,body,icon,image,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_image,var_link,var_date_created);

    RETURN NULL;    
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_create_comment_function() RETURNS TRIGGER AS $$
DECLARE
    var_username users.user_username%TYPE;
    var_note_id comments.note_id%TYPE;
    var_blog_id comments.blog_id%TYPE;
    var_idea_id comments.idea_id%TYPE;
    var_wikipedia_id comments.wikipedia_id%TYPE;
    var_tex_notes_id comments.tex_notes_id%TYPE;
    var_jupyter_notebooks_id comments.jupyter_notebooks_id%TYPE;
    var_markdown_notes_id comments.markdown_notes_id%TYPE;

    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_image notifications.image%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN
    SELECT 'create_comment' INTO var_topic;
    SELECT 'https://image.storething.org/frankmbrown/create_comment.png' INTO var_icon;
    SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;
    
    SELECT users.user_username, comments.note_id, comments.blog_id, comments.idea_id, comments.wikipedia_id, comments.tex_notes_id, comments.jupyter_notebooks_id, comments.markdown_notes_id 
    INTO var_username, var_note_id, var_blog_id, var_idea_id, var_wikipedia_id, var_tex_notes_id, var_jupyter_notebooks_id, var_markdown_notes_id
    FROM comments  
    JOIN users
    ON users.id=comments.user_id
    WHERE comments.id=NEW.comment_id;
    
    SELECT var_username || ': ' || NEW.document INTO var_body;

    IF var_note_id IS NOT NULL THEN 
        SELECT 'https://image.storething.org/frankmbrown/create_note.png' INTO var_icon;
        SELECT 'New Comment on ' || title, regexp_replace(image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/note/' || id::text || '/' || title INTO var_title, var_image, var_link FROM note WHERE var_note_id=note.id; 
    ELSIF var_blog_id IS NOT NULL THEN 
        SELECT 'https://image.storething.org/frankmbrown/create_blog.png' INTO var_icon;
        SELECT 'New Comment on ' || title, regexp_replace(image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/blog/' || id::text || '/' || title INTO var_title, var_image, var_link FROM blog WHERE var_blog_id=blog.id; 
    ELSIF var_idea_id IS NOT NULL THEN 
        SELECT 'https://image.storething.org/frankmbrown/create_idea.png' INTO var_icon;
        SELECT 'New Comment on ' || title, regexp_replace(image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/idea/' || id::text || '/' || title INTO var_title, var_image, var_link FROM idea WHERE var_idea_id=idea.id; 
    ELSIF var_wikipedia_id IS NOT NULL THEN
        SELECT 'https://image.storething.org/frankmbrown/create_daily_reading.png' INTO var_icon;
        SELECT 'New Comment on ' || topic_name, regexp_replace(topic_image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/daily-reading/' || id::text || '/' || topic_name INTO var_title, var_image, var_link FROM wikipedia WHERE var_wikipedia_id=wikipedia.id;
    ELSIF var_tex_notes_id IS NOT NULL THEN
        SELECT 'https://image.storething.org/frankmbrown/create_tex_note.png' INTO var_icon;
        SELECT 'New Comment on ' || note_title, regexp_replace(note_image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/tex-notes/' || id::text || '/' || note_title  INTO var_title, var_image, var_link FROM tex_notes WHERE tex_notes/id=var_tex_notes_id;
    ELSIF var_jupyter_notebooks_id IS NOT NULL THEN
        SELECT 'https://image.storething.org/frankmbrown/create_jupyter_notebook.png' INTO var_icon;
        SELECT 'New Comment on ' || title, regexp_replace(image_url,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/jupyter-notebooks/' || id::text || '/' || title INTO var_title, var_image, var_link FROM jupyter_notebooks WHERE jupyter_notebooks.id=var_jupyter_notebooks_id;
    ELSIF var_markdown_notes_id IS NOT NULL THEN
        SELECT 'https://image.storething.org/frankmbrown/create_markdown_note.png' INTO var_icon;
        SELECT 'New Comment on ' || title, regexp_replace(image_url,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/markdown-notes/' || id::text || '/' || title INTO var_title, var_image, var_link FROM markdown_notes WHERE markdown_notes.id=var_markdown_notes_id;
    ELSE
        RAISE EXCEPTION 'Unable to find what kind of article the comment was posted on.';
    END IF;

    INSERT INTO notifications (topic,title,body,icon,image,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_image,var_link,var_date_created);

    RETURN NULL;

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_create_jupyter_notebook_function() RETURNS TRIGGER AS $$
DECLARE
    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_image notifications.image%TYPE;    
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN
    SELECT 'create_jupyter_notebook' INTO var_topic;
    SELECT 'https://image.storething.org/frankmbrown/create_jupyter_notebook.png' INTO var_icon;
    SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;
    SELECT 'Jupyter Notebook Published: ' || NEW.title, NEW.description, regexp_replace(NEW.image_url,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/jupyter-notebooks/' || NEW.id::text || '/' || NEW.title INTO var_title, var_body, var_image, var_link;

    INSERT INTO notifications (topic,title,body,icon,image,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_image,var_link,var_date_created);

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_create_markdown_note_function() RETURNS TRIGGER AS $$
DECLARE
    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_image notifications.image%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN
    SELECT 'create_markdown_note' INTO var_topic;
    SELECT 'https://image.storething.org/frankmbrown/create_markdown_note.png' INTO var_icon;
    SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;
    SELECT 'Markdown Note Published: ' || NEW.title, NEW.description, regexp_replace(NEW.image_url,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/markdown-notes/' || NEW.id::text || '/' || NEW.title INTO var_title, var_body, var_image, var_link;

    INSERT INTO notifications (topic,title,body,icon,image,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_image,var_link,var_date_created);

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION on_create_daily_reading_insert_function() RETURNS TRIGGER AS $$
DECLARE
    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_image notifications.image%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN
    IF NEW.submitted=true THEN
        SELECT 'create_daily_reading' INTO var_topic;
        SELECT 'https://image.storething.org/frankmbrown/create_daily_reading.png' INTO var_icon;
        SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;
        SELECT 'Daily Reading Article Published: ' || NEW.topic_name, NEW.what_interested_you, regexp_replace(NEW.topic_image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/daily-reading/' || NEW.id::text || '/' || NEW.topic_name INTO var_title, var_body, var_image, var_link;

        INSERT INTO notifications (topic,title,body,icon,image,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_image,var_link,var_date_created);
    END IF;    
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_create_daily_reading_update_function() RETURNS TRIGGER AS $$
DECLARE
    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_image notifications.image%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN
    IF NEW.submitted=true THEN 
        SELECT 'create_daily_reading' INTO var_topic;
        SELECT 'https://image.storething.org/frankmbrown/create_daily_reading.png' INTO var_icon;
        SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;
        SELECT 'Daily Reading Article Published: ' || NEW.topic_name, NEW.what_interested_you, regexp_replace(NEW.topic_image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/daily-reading/' || NEW.id::text || '/' || NEW.topic_name INTO var_title, var_body, var_image, var_link;

        INSERT INTO notifications (topic,title,body,icon,image,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_image,var_link,var_date_created);
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_create_tex_note_function() RETURNS TRIGGER AS $$
DECLARE
    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_image notifications.image%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN
    IF NEW.published=true THEN
        SELECT 'create_tex_note' INTO var_topic;
        SELECT 'https://image.storething.org/frankmbrown/create_tex_note.png' INTO var_icon;
        SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;
        SELECT 'TeX Note Published: ' || NEW.note_title, NEW.note_description, regexp_replace(NEW.note_image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/tex-notes/' || NEW.id::text || '/' || NEW.note_title  INTO var_title, var_body, var_image, var_link;

        INSERT INTO notifications (topic,title,body,icon,image,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_image,var_link,var_date_created);
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_create_link_function() RETURNS TRIGGER AS $$
DECLARE
    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN
    SELECT 'create_link' INTO var_topic;
    SELECT 'https://image.storething.org/frankmbrown/create_link.png' INTO var_icon;
    SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;
    SELECT 'Link Added to Link Page', NEW.description INTO var_title, var_body;
    SELECT 'https://frankmbrown.net/links' INTO var_link;
    
    INSERT INTO notifications (topic,title,body,icon,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_link,var_date_created);
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_create_quote_function() RETURNS TRIGGER AS $$
DECLARE
    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN
    SELECT 'create_quote' INTO var_topic;
    SELECT 'https://image.storething.org/frankmbrown/create_quote.png' INTO var_icon;
    SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;
    SELECT 'Quote Added to Quote Page' INTO var_title;
    SELECT NEW.quote_text INTO var_body;
    SELECT 'https://frankmbrown.net/quotes' INTO var_link;
    
    INSERT INTO notifications (topic,title,body,icon,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_link,var_date_created);
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_create_survey_function() RETURNS TRIGGER AS $$
DECLARE 
    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_image notifications.image%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN 
    SELECT 'create_survey' INTO var_topic;
    SELECT 'https://image.storething.org/frankmbrown/create_survey.png' INTO var_icon;
    SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;
    SELECT 'Survey Created: ' || NEW.title, NEW.description_text, regexp_replace(NEW.image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/surveys/' || NEW.id::text || '/' || NEW.note_title  INTO var_title, var_body, var_image, var_link;
    
    INSERT INTO notifications (topic,title,body,icon,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_link,var_date_created);
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_create_letterboxd_function() RETURNS TRIGGER AS $$
DECLARE 
    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_image notifications.image%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN 
    SELECT 'create_letterboxd' INTO var_topic;
    SELECT 'https://image.storething.org/frankmbrown/create_letterboxd.png' INTO var_icon;
    SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;
    SELECT 'Movie Review: ' || NEW.title, NEW.description, regexp_replace(NEW.image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/letterboxd/' || NEW.id::text || '/' || NEW.title  INTO var_title, var_body, var_image, var_link;
    
    INSERT INTO notifications (topic,title,body,icon,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_link,var_date_created);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_create_goodreads_function() RETURNS TRIGGER AS $$
DECLARE 
    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_image notifications.image%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN 
    SELECT 'create_goodreads' INTO var_topic;
    SELECT 'https://image.storething.org/frankmbrown/fdbdbd24-f2b8-49ae-8bdb-42352909c674.png' INTO var_icon;
    SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;
    SELECT 'Book Review: ' || NEW.title, NEW.description, regexp_replace(NEW.image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/goodreads/' || NEW.id::text || '/' || NEW.title  INTO var_title, var_body, var_image, var_link;
    
    INSERT INTO notifications (topic,title,body,icon,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_link,var_date_created);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_create_game_function() RETURNS TRIGGER AS $$
DECLARE 
    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_image notifications.image%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN 
    SELECT 'create_game' INTO var_topic;
    SELECT 'https://image.storething.org/frankmbrown/create_game.png' INTO var_icon;
    SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;
    SELECT 'Created Game: ' || NEW.title, NEW.description, regexp_replace(NEW.image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/games/' || NEW.id::text || '/' || NEW.title  INTO var_title, var_body, var_image, var_link;
    
    INSERT INTO notifications (topic,title,body,icon,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_link,var_date_created);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_create_3d_design_function() RETURNS TRIGGER AS $$
DECLARE 
    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_image notifications.image%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN 
    SELECT 'create_3d_design' INTO var_topic;
    SELECT 'https://image.storething.org/frankmbrown/create_3d_design.png' INTO var_icon;
    SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;
    SELECT 'Created Design: ' || NEW.title, NEW.description, regexp_replace(NEW.image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/3d-designs/' || NEW.id::text || '/' || NEW.title  INTO var_title, var_body, var_image, var_link;
    
    INSERT INTO notifications (topic,title,body,icon,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_link,var_date_created);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_create_electronics_function() RETURNS TRIGGER AS $$
DECLARE 
    var_topic notifications.topic%TYPE;
    var_title notifications.title%TYPE;
    var_body notifications.body%TYPE;
    var_icon notifications.icon%TYPE;
    var_image notifications.image%TYPE;
    var_link notifications.link%TYPE;
    var_date_created notifications.date_created%TYPE;
BEGIN 
    SELECT 'create_electronics' INTO var_topic;
    SELECT 'https://image.storething.org/frankmbrown/create_electronics.png' INTO var_icon;
    SELECT EXTRACT(EPOCH FROM NOW()) INTO var_date_created;
    SELECT 'Electronics/Robotics Project: ' || NEW.title, NEW.description, regexp_replace(NEW.image,'https:\/\/image.storething.org\/frankmbrown(\/|\%2F)','https://image.storething.org/frankmbrown/twitter/'), 'https://frankmbrown.net/electronics-robotics/' || NEW.id::text || '/' || NEW.title  INTO var_title, var_body, var_image, var_link;
    
    INSERT INTO notifications (topic,title,body,icon,link,date_created) VALUES (var_topic,var_title,var_body,var_icon,var_link,var_date_created);
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

https://image.storething.org/frankmbrown/create_3d_design.png
https://image.storething.org/frankmbrown/create_game.png
https://image.storething.org/frankmbrown/create_letterboxd.png
https://image.storething.org/frankmbrown/create_goodreads.png



CREATE OR REPLACE FUNCTION confidence(ups INT, downs INT, z REAL DEFAULT 1) 
    RETURNS REAL AS $$
    DECLARE
        n INT;          -- Total number of votes
        phat REAL;      -- Proportion of positive votes
    BEGIN
        -- Calculate total votes
        n := ups + downs;

        -- If no votes, return 0 confidence
        IF n = 0 THEN 
            RETURN 0::REAL;
        END IF;
        
        -- Calculate proportion of positive votes
        phat := ups::REAL / n::REAL;

        -- Return the Wilson score interval lower bound
        RETURN (phat + z*z/(2*n) - z * sqrt((phat*(1-phat) + z*z/(4*n)) / n)) / (1 + z*z/n);
    END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_comment_rating(in_id comments.id%TYPE) RETURNS boolean AS $$
    BEGIN 
    WITH comment_likes_cte AS (
    SELECT 
    count(comment_likes.user_id) comment_like_count, 
    comment_likes.comment_id id
    FROM comments 
    JOIN comment_likes
    ON comments.id=comment_likes.comment_id
    WHERE comments.id=in_id
    GROUP BY comment_likes.comment_id
    ), comment_viewed_info AS (
    SELECT 
    count(comment_views.id) comment_views_count,
    comment_views.comment_id id 
    FROM comments 
    JOIN comment_views 
    ON comments.id=comment_views.comment_id 
    WHERE comments.id=in_id
    GROUP BY comment_views.comment_id
    ), comment_comments AS (
    SELECT 
    count(id) comment_count,
    parent_comment_id id 
    FROM comments 
    WHERE comments.id=in_id
    GROUP BY comments.parent_comment_id
    ) UPDATE comments SET rating = confidence(
    (COALESCE(20 * comment_comments.comment_count, 0) + COALESCE(comment_likes_cte.comment_like_count, 0))::int, 
    COALESCE(comment_viewed_info.comment_views_count / 10, 0)::int
    ) * (COALESCE(20 * comment_comments.comment_count, 0) +  COALESCE(comment_likes_cte.comment_like_count, 0)::int - COALESCE(comment_viewed_info.comment_views_count / 10, 0)::int )
    FROM comment_likes_cte 
    FULL JOIN comment_viewed_info 
    ON comment_likes_cte.id= comment_viewed_info.id 
    FULL JOIN comment_comments 
    ON comment_comments.id=comment_likes_cte.id
    WHERE comments.id=in_id;

    RETURN true;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_comment_like_unlike_delete_function() RETURNS TRIGGER AS $$
    DECLARE 
        comment_id comments.id%TYPE;
        temp_bool boolean;
    BEGIN 
        SELECT update_comment_rating(OLD.comment_id) INTO temp_bool;
        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_comment_like_unlike_insert_function() RETURNS TRIGGER AS $$
    DECLARE 
        comment_id comments.id%TYPE;
        temp_bool boolean;
    BEGIN 
        SELECT update_comment_rating(NEW.comment_id) INTO temp_bool;
        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_comment_view_function() RETURNS TRIGGER AS $$
    DECLARE 
        comment_id comments.id%TYPE;
        temp_bool boolean;
    BEGIN
        SELECT update_comment_rating(NEW.comment_id) INTO temp_bool;
        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_comment_comment_function() RETURNS TRIGGER AS $$
    DECLARE 
        comment_id comments.id%TYPE;
        temp_bool boolean;
    BEGIN 
        IF NEW.parent_comment_id IS NOT NULL THEN 
            SELECT update_comment_rating(NEW.parent_comment_id) INTO temp_bool;
        END IF;
        SELECT update_comment_rating(NEW.id) INTO temp_bool;
        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_annotation_rating(in_id annotations.id%TYPE) RETURNS boolean AS $$
    BEGIN 
    WITH upvote_cte AS (
    SELECT 
    count(annotation_votes.id) votes,
    annotation_id id
    FROM annotation_votes
    WHERE annotation_votes.id=in_id AND upvote=true
    GROUP BY annotation_votes.annotation_id
), downvote_cte AS (
    SELECT 
    count(annotation_votes.id) votes,
    annotation_id id
    FROM annotation_votes
    WHERE annotation_votes.id=in_id AND downvote=true
    GROUP BY annotation_votes.annotation_id
) UPDATE annotations SET rating = confidence(COALESCE(upvote_cte.votes, 0)::int, COALESCE(downvote_cte.votes, 0)::int) * (COALESCE(upvote_cte.votes, 0)::int - COALESCE(downvote_cte.votes, 0)::int)
FROM upvote_cte 
FULL JOIN downvote_cte 
ON downvote_cte.id=upvote_cte.id
WHERE annotations.id=in_id;
    RETURN true;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_annotation_upvote_downvote_insert_function() RETURNS TRIGGER AS $$ 
    DECLARE 
        temp_bool boolean;
    BEGIN
        SELECT update_annotation_rating(NEW.annotation_id) INTO temp_bool;
        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_annotation_upvote_downvote_update_function() RETURNS TRIGGER AS $$ 
    DECLARE 
        temp_bool boolean;
    BEGIN
        SELECT update_annotation_rating(NEW.annotation_id) INTO temp_bool;
        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_annotation_upvote_downvote_delete_function() RETURNS TRIGGER AS $$ 
    DECLARE 
        temp_bool boolean;
    BEGIN
        SELECT update_annotation_rating(OLD.annotation_id) INTO temp_bool;
        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER on_comment_like_unlike_insert AFTER INSERT ON comment_likes FOR EACH ROW EXECUTE FUNCTION on_comment_like_unlike_insert_function();
CREATE OR REPLACE TRIGGER on_comment_like_unlike_delete AFTER DELETE ON comment_likes FOR EACH ROW EXECUTE FUNCTION on_comment_like_unlike_delete_function();
CREATE OR REPLACE TRIGGER on_comment_view AFTER INSERT ON comment_views FOR EACH ROW EXECUTE FUNCTION on_comment_view_function();
CREATE OR REPLACE TRIGGER on_comment_comment AFTER INSERT ON comments FOR EACH ROW EXECUTE FUNCTION on_comment_comment_function();

CREATE OR REPLACE TRIGGER  on_annotation_upvote_downvote_insert AFTER INSERT ON annotation_votes FOR EACH ROW EXECUTE FUNCTION on_annotation_upvote_downvote_insert_function();
CREATE OR REPLACE TRIGGER on_annotation_upvote_downvote_update AFTER UPDATE ON annotation_votes FOR EACH ROW EXECUTE FUNCTION on_annotation_upvote_downvote_update_function();
CREATE OR REPLACE TRIGGER on_annotation_upvote_downvote_delete AFTER UPDATE ON annotation_votes FOR EACH ROW EXECUTE FUNCTION on_annotation_upvote_downvote_delete_function();



-- 4

-- On INSERT, get the note/idea/blog_id, check that table to see if active_v is not null and that the active_v matches the active_v of the article that was inserted
CREATE OR REPLACE TRIGGER on_create_note AFTER INSERT ON note FOR EACH ROW EXECUTE FUNCTION on_create_note_function();
CREATE OR REPLACE TRIGGER on_create_blog AFTER INSERT ON blog FOR EACH ROW EXECUTE FUNCTION on_create_blog_function();
CREATE OR REPLACE TRIGGER on_create_idea AFTER INSERT ON idea FOR EACH ROW EXECUTE FUNCTION on_create_idea_function();

-- Check to see if NEW.last_edited > OLD.last_edited AND active_v IS NOT NULL or check to see if NEW.active_v<>OLD.active_v
CREATE OR REPLACE TRIGGER on_update_note AFTER UPDATE ON note FOR EACH ROW EXECUTE FUNCTION on_update_note_function();
CREATE OR REPLACE TRIGGER on_update_blog AFTER UPDATE ON blog FOR EACH ROW EXECUTE FUNCTION on_update_blog_function();
CREATE OR REPLACE TRIGGER on_update_idea AFTER UPDATE ON idea FOR EACH ROW EXECUTE FUNCTION on_update_idea_function();



-- These are pretty self-explanatory
CREATE OR REPLACE TRIGGER on_create_annotation AFTER INSERT ON annotation_search FOR EACH ROW EXECUTE FUNCTION on_create_annotation_function();
CREATE OR REPLACE TRIGGER on_create_comment AFTER INSERT ON comment_search  FOR EACH ROW EXECUTE FUNCTION on_create_comment_function();
CREATE OR REPLACE TRIGGER on_create_jupyter_notebook AFTER INSERT ON jupyter_notebooks FOR EACH ROW EXECUTE FUNCTION on_create_jupyter_notebook_function();
CREATE OR REPLACE TRIGGER on_create_markdown_note AFTER INSERT ON markdown_notes FOR EACH ROW EXECUTE FUNCTION on_create_markdown_note_function();
CREATE OR REPLACE TRIGGER on_create_daily_reading_insert AFTER INSERT ON wikipedia FOR EACH ROW EXECUTE FUNCTION on_create_daily_reading_insert_function();
CREATE OR REPLACE TRIGGER on_create_daily_reading_update AFTER UPDATE ON wikipedia FOR EACH ROW EXECUTE FUNCTION on_create_daily_reading_update_function();
CREATE OR REPLACE TRIGGER on_create_tex_note AFTER UPDATE ON tex_notes FOR EACH ROW EXECUTE FUNCTION on_create_tex_note_function();
CREATE OR REPLACE TRIGGER on_create_link AFTER INSERT ON links FOR EACH ROW EXECUTE FUNCTION on_create_link_function();
CREATE OR REPLACE TRIGGER on_create_quote AFTER INSERT ON quotes FOR EACH ROW EXECUTE FUNCTION on_create_quote_function();

CREATE OR REPLACE TRIGGER on_create_survey AFTER INSERT ON surveys FOR EACH ROW EXECUTE FUNCTION on_create_survey_function();
CREATE OR REPLACE TRIGGER on_create_letterboxd AFTER INSERT ON letterboxd FOR EACH ROW EXECUTE FUNCTION on_create_letterboxd_function();
CREATE OR REPLACE TRIGGER on_create_goodreads AFTER INSERT ON goodreads FOR EACH ROW EXECUTE FUNCTION on_create_goodreads_function();

CREATE OR REPLACE TRIGGER on_create_game AFTER INSERT ON games FOR EACH ROW EXECUTE FUNCTION on_create_game_function();
CREATE OR REPLACE TRIGGER on_create_desigm AFTER INSERT ON designs_3d FOR EACH ROW EXECUTE FUNCTION on_create_3d_design_function();

CREATE OR REPLACE TRIGGER on_create_electronics AFTER INSERT ON electronics_projects FOR EACH ROW EXECUTE FUNCTION on_create_electronics_function();


CREATE OR REPLACE FUNCTION check_unvalidated_media_after_insert(type_id TEXT, in_id integer) 
RETURNS TABLE(nsfw boolean, sfw boolean) AS $$
DECLARE 
    sfw_temp boolean;
BEGIN
    IF type_id = 'chat_id' THEN 
        SELECT unvalidated_media.nsfw INTO sfw_temp FROM unvalidated_media WHERE chat_id=in_id ORDER BY unvalidated_media.nsfw DESC NULLS FIRST;
    ELSIF type_id='comment_id' THEN
        SELECT unvalidated_media.nsfw INTO sfw_temp FROM unvalidated_media WHERE comment_id=in_id ORDER BY unvalidated_media.nsfw DESC NULLS FIRST;
    ELSE 
        RAISE EXCEPTION 'Invalid `type_id`';
    END IF; 

    IF sfw_temp IS NULL THEN 
        RETURN;
    ELSIF sfw_temp=true THEN 
        RETURN QUERY SELECT FALSE, TRUE;
    ELSE 
        RETURN QUERY SELECT TRUE, FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_insert_image_nsfw_function() RETURNS TRIGGER AS $$ 
    DECLARE 
        is_nsfw boolean;
        temp_image_id int;
    BEGIN
        UPDATE unvalidated_media SET nsfw=NEW.nsfw > 90 WHERE image_id=NEW.image_id;
        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_insert_audio_flagged() RETURNS TRIGGER AS $$
BEGIN 
    UPDATE unvalidated_media SET nsfw=NEW.flagged WHERE audio_id=NEW.audio_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION on_insert_video_flagged() RETURNS TRIGGER AS $$
BEGIN 
    UPDATE unvalidated_media SET nsfw=NEW.flagged WHERE video_id=NEW.video_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_update_unvalidated_media() RETURNS TRIGGER AS $$
BEGIN 
    IF NEW.nsfw IS NULL THEN 
        RETURN NULL;
    ELSIF NEW.nsfw = false THEN 
        IF NEW.chat_id IS NOT NULL THEN 
            DELETE FROM chat WHERE id=NEW.id;
        ELSIF NEW.comment_id IS NOT NULL THEN 
            DELETE FROM comments WHERE id=NEW.id;
        END IF;
    ELSIF NEW.nsfw = true THEN 
        IF NEW.chat_id IS NOT NULL THEN 
            UPDATE chat SET validated=true WHERE id=NEW.id;
        ELSIF NEW.comment_id IS NOT NULL THEN 
            UPDATE comments SET validated=true WHERE id=NEW.id;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_insert_image_nsfw_trigger AFTER INSERT ON image_nsfw FOR EACH ROW EXECUTE FUNCTION on_insert_image_nsfw_function();

CREATE OR REPLACE TRIGGER on_insert_audio_flagged_trigger AFTER INSERT ON audio_transcription_moderation FOR EACH ROW EXECUTE FUNCTION on_insert_audio_flagged();

CREATE OR REPLACE TRIGGER on_insert_video_flagged_trigger AFTER INSERT ON video_transcription_moderation FOR EACH ROW EXECUTE FUNCTION on_insert_video_flagged();

CREATE OR REPLACE TRIGGER on_update_unvalidated_media_trigger AFTER UPDATE ON unvalidated_media FOR EACH ROW EXECUTE FUNCTION on_update_unvalidated_media();