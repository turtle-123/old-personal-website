function onFacebookClick() {
  const a = document.createElement('a');
  a.href = `https://www.facebook.com/share.php?u=${encodeURI(window.location.href)}`;
  a.target="_blank";
  a.click();
}
function onTwitterClick() {
  const a = document.createElement('a');
  var text = 'frankmbrown Post';
  const title = document.getElementById('PAGE_TITLE');
  if (title) {
    text = title.innerText.trim();
  }
  a.href = `http://twitter.com/share?&url=${encodeURI(window.location.href)}&text=${encodeURI(text)}`;
  a.target="_blank";
  a.click();
}
function onRedditClick() {
  const a = document.createElement('a');
  const title = document.querySelector('title');
  a.href = `http://www.reddit.com/submit?url=${encodeURI(window.location.href)}&title=${encodeURIComponent(String(title?.innerText?.trim()))}&type=LINK`;
  a.target="_blank";
  a.click();
}
function onLinkedinClick() {
  const a = document.createElement('a');
  a.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURI(window.location.href)}`;
  a.target="_blank";
  a.click();
}
function onEmailClick() {
  const title = document.querySelector<HTMLTitleElement>('title');
  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  const mailtoLink = `mailto:?subject=${encodeURIComponent(String(title?.innerText?.trim()))}&body=${encodeURIComponent(String((description?.getAttribute('content')||'')?.trim()))}`;
  const a = document.createElement('a');
  a.href = mailtoLink
  a.target="_blank";
  a.click();
}
function onPinterestClick() {
  const a = document.createElement('a');
  const title = encodeURIComponent(document.title);
  const url = encodeURIComponent(window.location.href);
  const image = encodeURIComponent(document.getElementById('META_OG_IMAGE')?.getAttribute('content')||'');
  a.href=`https://pinterest.com/pin/create/button/?url=${url}&media=${image}&description=${title}`;
  a.target="_blank";
  a.click();
}
function onWhatsAppClick() {
  const a = document.createElement('a');
  const title = encodeURIComponent(document.title);
  const url = encodeURIComponent(window.location.href);
  a.href=`https://api.whatsapp.com/send?text=${title} ${url}`;
  a.target="_blank";
  a.click();
}
function onTelegramClick() {
  const a = document.createElement('a');
  const title = encodeURIComponent(document.title);
  const url = encodeURIComponent(window.location.href);
  a.href=`https://telegram.me/share/url?url=${url}&text=${title}`;
  a.target="_blank";
  a.click();
}
function onTumblrClick() {
  const a = document.createElement('a');
  const title = encodeURIComponent(document.title);
  const url = encodeURIComponent(window.location.href);
  const description = document.getElementById('PAGE_DESCRIPTION')?.getAttribute('content')||'';
  a.href=`https://www.tumblr.com/widgets/share/tool?canonicalUrl=${url}&title=${title}&caption=${description}`;
  a.target="_blank";
  a.click();
}
function onPocketClick() {
  const a = document.createElement('a');
  const title = encodeURIComponent(document.title);
  const url = encodeURIComponent(window.location.href);
  a.href=`https://getpocket.com/save?url=${url}&title=${title}`;
  a.target="_blank";
  a.click();
}
function onBufferClick() {
  const a = document.createElement('a');
  const title = encodeURIComponent(document.title);
  const url = encodeURIComponent(window.location.href);
  a.href=`https://buffer.com/add?text=${title}&url=${url}`;
  a.target="_blank";
  a.click();
}
function onDiggClick() {
  const a = document.createElement('a');
  const title = encodeURIComponent(document.title);
  const url = encodeURIComponent(window.location.href);
  a.href=`https://digg.com/submit?url=${url}&title=${title}`;
  a.target="_blank";
  a.click();
}
function onMixClick() {
  const a = document.createElement('a');
  const url = encodeURIComponent(window.location.href);
  a.href=`https://mix.com/add?url=${url}`;
  a.target="_blank";
  a.click();
}
function onVKontakteClick() {
  const a = document.createElement('a');
  const title = encodeURIComponent(document.title);
  const url = encodeURIComponent(window.location.href);
  const description = document.getElementById('PAGE_DESCRIPTION')?.getAttribute('content')||'';
  const image = encodeURIComponent(document.getElementById('META_OG_IMAGE')?.getAttribute('content')||'');
  a.href=`https://vk.com/share.php?url=${url}&title=${title}&description=${description}&image=${image}&noparse=true`;
  a.target="_blank";
  a.click();
}
function onXINGClick() {
  const a = document.createElement('a');
  const url = encodeURIComponent(window.location.href);
  a.href=`https://www.xing.com/spi/shares/new?url=${url}`;
  a.target="_blank";
  a.click();
}
function onEvernoteClick() {
  const a = document.createElement('a');
  const title = encodeURIComponent(document.title);
  const url = encodeURIComponent(window.location.href);
  a.href=`https://www.evernote.com/clip.action?url=${url}&title=${title}`;
  a.target="_blank";
  a.click();
}
function onHackerClick() {
  const a = document.createElement('a');
  const title = encodeURIComponent(document.title);
  const url = encodeURIComponent(window.location.href);
  a.href=`https://news.ycombinator.com/submitlink?u=${url}&t=${title}`;
  a.target="_blank";
  a.click();
}
function onFlipboardClick() {
  const a = document.createElement('a');
  const title = encodeURIComponent(document.title);
  const url = encodeURIComponent(window.location.href);
  a.href=`https://share.flipboard.com/bookmarklet/popout?url=${url}&title=${title}`;
  a.target="_blank";
  a.click();
}
function onMeneameClick() {
  const a = document.createElement('a');
  const url = encodeURIComponent(window.location.href);
  a.href=`https://www.meneame.net/submit.php?url=${url}`;
  a.target="_blank";
  a.click();
}
function onBloggerClick() {
  const a = document.createElement('a');
  const title = encodeURIComponent(document.title);
  const url = encodeURIComponent(window.location.href);
  const description = document.getElementById('PAGE_DESCRIPTION')?.getAttribute('content')||'';
  a.href=`https://www.blogger.com/blog-this.g?u=${url}&n=${title}&t=${description}`;
  a.target="_blank";
  a.click();
}
function onOdnoklassnikiClick() {
  const a = document.createElement('a');
  const url = encodeURIComponent(window.location.href);
  a.href=`https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl=${url}`;
  a.target="_blank";
  a.click();
}
function onYahooClick() {
  const a = document.createElement('a');
  const url = encodeURIComponent(window.location.href);
  a.href=`http://compose.mail.yahoo.com/?body=${url}`;
  a.target="_blank";
  a.click();
}
function onGoogleClick() {
  const a = document.createElement('a');
  const title = encodeURIComponent(document.title);
  const url = encodeURIComponent(window.location.href);
  const description = document.getElementById('PAGE_DESCRIPTION')?.getAttribute('content')||'';
  a.href=`https://www.google.com/bookmarks/mark?op=add&bkmk=${url}&title=${title}&annotation=${description}`;
  a.target="_blank";
  a.click();
}
function onLineClick() {
  const a = document.createElement('a');
  const url = encodeURIComponent(window.location.href);
  a.href=`https://social-plugins.line.me/lineit/share?url=${url}`;
  a.target="_blank";
  a.click();
}
function onRenrenClick() {
  const a = document.createElement('a');
  const title = encodeURIComponent(document.title);
  const url = encodeURIComponent(window.location.href);
  const description = document.getElementById('PAGE_DESCRIPTION')?.getAttribute('content')||'';
  a.href=`http://widget.renren.com/dialog/share?resourceUrl=${url}&srcUrl=${url}&title=${title}&description=${description}`;
  a.target="_blank";
  a.click();
}
function onWeiboClick() {
  const a = document.createElement('a');
  const title = encodeURIComponent(document.title);
  const url = encodeURIComponent(window.location.href);
  a.href=`http://service.weibo.com/share/share.php?url=${url}&title=${title}&pic=&appkey=`;
  a.target="_blank";
  a.click();
}
function onBaiduClick() {
  const a = document.createElement('a');
  const title = encodeURIComponent(document.title);
  const url = encodeURIComponent(window.location.href);
  a.href=`http://cang.baidu.com/do/add?it=${title}&iu=${url}&fr=ien#nw=1`;
  a.target="_blank";
  a.click();
}
/**
 * Only call on new page load
 */
export function setSocialMediaShareButtons() {
  const facebook = document.getElementById('share-facebook-article');
  if (facebook) facebook.addEventListener('click',onFacebookClick);
  const twitter =  document.getElementById('share-x-article');
  if (twitter) twitter.addEventListener('click',onTwitterClick);
  const reddit =   document.getElementById('share-reddit-article');
  if (reddit) reddit.addEventListener('click',onRedditClick);
  const linkedin = document.getElementById('share-linkedin-article');
  if (linkedin) linkedin.addEventListener('click',onLinkedinClick);
  const email = document.getElementById('share-email-article');
  if (email) email.addEventListener('click',onEmailClick);
  const pinterest = document.getElementById('share-article-pinterest');
  if (pinterest) pinterest.addEventListener('click',onPinterestClick);
  const WhatsApp = document.getElementById('share-article-WhatsApp');
  if (WhatsApp) WhatsApp.addEventListener('click',onWhatsAppClick);
  const Telegram = document.getElementById('share-article-Telegram');
  if (Telegram) Telegram.addEventListener('click',onTelegramClick);
  const Tumblr = document.getElementById('share-article-Tumblr');
  if (Tumblr) Tumblr.addEventListener('click',onTumblrClick);
  const Pocket = document.getElementById('share-article-Pocket');
  if (Pocket) Pocket.addEventListener('click',onPocketClick);
  const Buffer = document.getElementById('share-article-Buffer');
  if (Buffer) Buffer.addEventListener('click',onBufferClick);
  const Digg = document.getElementById('share-article-Digg');
  if (Digg) Digg.addEventListener('click',onDiggClick);
  const Mix = document.getElementById('share-article-Mix');
  if (Mix) Mix.addEventListener('click',onMixClick);
  const VKontakte = document.getElementById('share-article-VKontakte');
  if (VKontakte) VKontakte.addEventListener('click',onVKontakteClick);
  const XING = document.getElementById('share-article-XING');
  if (XING) XING.addEventListener('click',onXINGClick);
  const Evernote = document.getElementById('share-article-Evernote');
  if (Evernote) Evernote.addEventListener('click',onEvernoteClick);
  const HackerNews = document.getElementById('share-article-HackerNews');
  if (HackerNews) HackerNews.addEventListener('click',onHackerClick);
  const Flipboard = document.getElementById('share-article-Flipboard');
  if (Flipboard) Flipboard.addEventListener('click',onFlipboardClick);
  const meneame = document.getElementById('share-article-meneame');
  if (meneame) meneame.addEventListener('click',onMeneameClick);
  const blogger = document.getElementById('share-article-blogger');
  if (blogger) blogger.addEventListener('click',onBloggerClick);
  const Odnoklassniki = document.getElementById('share-article-Odnoklassniki');
  if (Odnoklassniki) Odnoklassniki.addEventListener('click',onOdnoklassnikiClick);
  const yahoo_mai = document.getElementById('share-article-yahoo_mai');
  if (yahoo_mai) yahoo_mai.addEventListener('click',onYahooClick);
  const google_bookmarks = document.getElementById('share-article-google_bookmarks');
  if (google_bookmarks) google_bookmarks.addEventListener('click',onGoogleClick);
  const line = document.getElementById('share-article-line');
  if (line) line.addEventListener('click',onLineClick);
  const renren = document.getElementById('share-article-renren');
  if (renren) renren.addEventListener('click',onRenrenClick);
  const weibo = document.getElementById('share-article-weibo');
  if (weibo) weibo.addEventListener('click',onWeiboClick);
  const baidu = document.getElementById('share-article-baidu');
  if (baidu) baidu.addEventListener('click',onBaiduClick);
}