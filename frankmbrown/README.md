# Frank Brown's Personal Website

## How To Replace the Node Code on this Website

### SSH Into Server:

```bash 
$ sudo ssh -i "frakmbrown-ec2-key-pair.pem" ec2-user@ec2-3-92-223-185.compute-1.amazonaws.com
```

```bash
$ # MAKE SURE TO RUN BUILD ON CLIENT BEFORE PUSHING
$ cd $CODE
$ sudo cp node_modules /home/ec2-user/temp_node_modules
$ sudo rm -r * # Remove all files from directory
$ sudo rm -r .* # Remove all hidden files from directory
$ git clone https://github.com/turtle-123/frankmbrown.net.git .
$ mkdir node_modules && sudo cp /home/ec2-user/temp_node_modules node_modules
$ npm i /home/ec2-user/temp_node_modules node_modules
$ sudo rm -r /usr/share/nginx/css && sudo rm -r /usr/share/nginx/js && sudo cp -r /home/ec2-user/CODE/static/css /usr/share/nginx/css && sudo cp -r /home/ec2-user/CODE/static/js /usr/share/nginx/js && sudo rm /usr/share/nginx/html/browserconfig.xml && sudo cp /home/ec2-user/CODE/static/browserconfig.xml /usr/share/nginx/html && sudo rm /usr/share/nginx/html/favicon.ico && sudo cp /home/ec2-user/CODE/static/favicon.ico /usr/share/nginx/html && sudo rm /usr/share/nginx/html/manifest.json && sudo cp /home/ec2-user/CODE/static/manifest.json /usr/share/nginx/html && sudo rm /usr/share/nginx/html/robots.txt && sudo cp /home/ec2-user/CODE/static/robots.txt /usr/share/nginx/html
$ npm i
$ sudo systemctl restart myapp.service
$ # RUN `npm run update-cloudfront-assets` on personal computer after updating
```

## How To Replace Flask Code on this Website

```bash
$ sudo systemctl stop flask_app.service
$ cd $FLASK_CODE
 # if the virtual environment is still activated
    $ deactivate
$ sudo rm -r .*
$ sudo rm -r *
$ git clone https://github.com/turtle-123/django-backend-personal.git .
$ # Look at `things_to_install.txt` and install all packages in there 
$ sudo systemctl start flask_app.service
```


### Important Files on the Server 

#### Nginx Configuration File:

- Located `/etc/nginx/nginx.conf`
- To restart nginx: `systemctl restart nginx`
- **Note**: The following files are served by nginx:
    - `/favicon.ico`
    - `/manifest.json`
    - `/robots.txt`
    - `/browserconfig.xml`
    - Plus pages for 502 and 504 errors, which you can see in the 

#### Systemd File for Node Backend

- Configuration file: `/etc/systemd/system/myapp.service`
- **Note**: This runs on port `8080`

#### Systemd File for Flask Backend

- Configuration file: `/etc/systemd/system/flask_app.service`
- gunicorn -b :8000 app:app
- **Note**: This runs on port `8000`
- Make sure to run the app on some




### Rsync: Local To Server 

```bash 
$ # Frank frankmbrown
$ fire /path/to/example.txt ec2-user@ec2-3-92-223-185.compute-1.amazonaws.com:/path/to/destination/
$ # Example: Better to move to home directory (than /usr/share/nginx/html) since less permissions
$ rsync -avz -e "ssh -i SSH/frakmbrown-ec2-key-pair.pem" static/browserconfig.xml ec2-user@ec2-3-92-223-185.compute-1.amazonaws.com:/home/ec2-user
$ rsync -avz -e "ssh -i SSH/frakmbrown-ec2-key-pair.pem" static/favicon.ico ec2-user@ec2-3-92-223-185.compute-1.amazonaws.com:/home/ec2-user
$ rsync -avz -e "ssh -i SSH/frakmbrown-ec2-key-pair.pem" static/manifest.json ec2-user@ec2-3-92-223-185.compute-1.amazonaws.com:/home/ec2-user
$ rsync -avz -e "ssh -i SSH/frakmbrown-ec2-key-pair.pem" static/robots.txt ec2-user@ec2-3-92-223-185.compute-1.amazonaws.com:/home/ec2-user
```


### Page Layout

```typescript 
/* ----------------------- Imports -------------------------- */

/* ----------------------- Types -------------------------- */


/* ----------------------- Constants ----------------------- */ 


/* --------------------- Helper Functions ------------------ */ 


/* ---------------------- Functions ------------------------- */


```

## Images

- Include `no-index: true` in the Image Metadata if you don't want to insert images in the database


## Notifications

- `create_annotation`
    - When something is INSERTed into annotations
- `create_note`
    - When something is UPDATEd in note table - check to see if L
- `update_note`
    - When something is INSERTed into article with a nun-NULL note_id and when the note.active_v===article.v
- `create_blog`
     - 
- `update_blog`
    - When something is INSERTed into article with a nun-NULL blog_id and when the blog.active_v===article.v
- `create_idea` 
    - 
- `update_idea`
    - When something is INSERTed into article with a nun-NULL idea_id and when the idea.active_v===article.v
- `create_comment`
    - When something is INSERTed into comments
- `create_jupyter_notebook`
    - When something is INSERTed into Jupyter Notebooks
- `create_markdown_note`
    - When something is INSERTed into Markdown Notes
- `create_stream_consciousness`
    - hen something is INSERTed into Stream of Consciousness
- `create_daily_reading`
    - When something is INSERTed into wikipedia
- `create_tex_note`
    - When something is INSERTed into tex_note


## Before Running Frontend 

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\fmb20\Desktop\CODE\certificates\firebase-cloud-messaging-service-account.json"
```