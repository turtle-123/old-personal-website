// /**
//  * [Reference for Embedding Page](https://developers.facebook.com/docs/graph-api/reference/oembed-page/)
//  * 
//  * [Reference for Embedding Post](https://developers.facebook.com/docs/graph-api/reference/oembed-post/)
//  * 
//  * [Reference for Embedding Video](https://developers.facebook.com/docs/graph-api/reference/oembed-video/)
//  * 
//  * @param form 
//  * @param e 
//  * @param dialog 
//  */
// async function handleEmbedFacebook(form: HTMLFormElement,e:Event,dialog: HTMLDialogElement) {
//   onEmbedError(dialog);
//   return;
//   // try {
//   //   const formID = form.getAttribute('id');
//   //   if (formID==="embed-facebook-page-form"){
//   //     const url = form.querySelector<HTMLInputElement>('input[id="facebook-page-url"]');
//   //     const hideCover = form.querySelector<HTMLInputElement>('input[id="facebook-page-hide-cover"]');
//   //     const showFacepile = form.querySelector<HTMLInputElement>('input[id="facebook-page-show-facepile"]');
//   //     const showPosts = form.querySelector<HTMLInputElement>('input[id="facebook-page-show-posts"]');
//   //     const smallHeader = form.querySelector<HTMLInputElement>('input[id="facebook-page-small-header"]');
//   //     if (!!!url || !!!hideCover || !!!showFacepile || !!!showPosts || !!!smallHeader) throw new Error('Unable to get inputs for embedding facebook page.');
//   //     const body = {
//   //       embed_type: 'facebook-page',
//   //       url: url.value,
//   //       hide_cover: Boolean(hideCover.checked===true),
//   //       show_facepile: Boolean(showFacepile.checked===true),
//   //       show_posts: Boolean(showPosts.checked===true),
//   //       small_header: Boolean(smallHeader.checked===true)
//   //     };
//   //     const resp = await fetch('/api/embed',{method:'POST',body:JSON.stringify(body), headers: {'Content-Type':'application/json'}});
//   //     if (resp.status!==200) throw new Error('Something went wrong embedding Facebook Page content.');
//   //   } else if (formID==="embed-facebook-post-form"){
//   //     const url = form.querySelector<HTMLInputElement>('input[id="facebook-post-url"]');
//   //     if (!!!url) throw new Error('Unable to get inputs for embedding facebook post.');
//   //     const body = { embed_type: 'facebook-post', url: url.value };
//   //     const resp = await fetch('/api/embed',{method:'POST',body:JSON.stringify(body),headers:{'Content-Type':'application/json'}});
//   //     if (resp.status!==200) throw new Error('Something went wrong embedding Facebook Post content.');
    
//   //   } else if (formID==="embed-facebook-video-form") {
//   //     const url = form.querySelector<HTMLInputElement>('input[id="facebook-video-url"]');
//   //     if (!!!url) throw new Error('Unable to get inputs for embedding facebook video.');
//   //     const body = { embed_type: 'facebook-video', url: url.value };
//   //     const resp = await fetch('/api/embed',{method:'POST',body:JSON.stringify(body),headers:{'Content-Type':'application/json'}});
//   //     if (resp.status!==200) throw new Error('Something went wrong embedding Facebook Video content.');
//   //   } else throw new Error('Form ID not recognized.');
//   // } catch (error) {
//   //   closeLoadingDialog();
//   //   onEmbedError(dialog);
//   // }
// }

// export type TikTokResponse = {
//   html: string;
//   script: string;
//   url: string;
// };
// /**
//  * Embed tiktok videos
//  * @param form 
//  * @param e 
//  * @param dialog 
//  */
// async function handleEmbedTiktok(form: HTMLFormElement,e:Event,dialog: HTMLDialogElement) {
//   try {
//     const urlInput = form.querySelector<HTMLInputElement>('input[id="lex-embed-tiktok-input"]');
//     if (!!!urlInput) throw new Error('Unable to find tiktok input for embedding tiktoks.');
//     const url = urlInput.value;
//     const body = {
//       embed_type: 'tiktok', 
//       url
//     };
//     const resp = await fetch('/api/embed',{method: 'POST',body: JSON.stringify(body), headers: {'Content-Type': 'application/json'} });
//     if (resp.status!==200) throw new Error('Something went wrong embedding TikTok content.');
//     const obj = await resp.json() as TikTokResponse;
//     const editor = getCurrentEditor();
//     if (editor) editor.dispatchCommand(INSERT_TIKTOK_NODE_COMMAND,obj);
//     onEmbedSuccess(form,dialog);
//   } catch (error) {
//     closeLoadingDialog();
//     onEmbedError(dialog);
//   }
// }
// export type TweetResponse = {
//   html: string;
//   script: string;
//   url: string;
//   hideCards: boolean;
//   hideConversation: boolean;
//   useDarkMode: boolean;
//   align: "left" | "center" | "right";
// };
// export type TwitterTimelineResponse = {
//   html: string;
//   script: string;
//   url: string;
//   limit: number;
//   darkMode: boolean;
//   componentBorders: string;
//   noHeader: boolean;
//   noFooter: boolean;
//   noBorders: boolean;
//   noScrollbar: boolean;
//   transparent: boolean;
// };
// /**
//  * [Reference For Tweets](https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference)
//  * 
//  * [Reference for Timelines](https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/oembed-api)
//  * @param form 
//  * @param e 
//  * @param dialog 
//  */
// async function handleEmbedTwitter(form: HTMLFormElement,e:Event,dialog: HTMLDialogElement) {
//   try {
//     const formID = form.getAttribute('id') as string;
//     if (formID === 'embed-tweet-form') {
//       const urlInput = form.querySelector<HTMLInputElement>('input[id="lex-embed-twitter-input"]');
//       const hideCards = form.querySelector<HTMLInputElement>('input[id="embed-twitter-hide-cards"]');
//       const hideConversation = form.querySelector<HTMLInputElement>('input[id="embed-twitter-conversation"]');
//       const darkMode = form.querySelector<HTMLInputElement>('input[id="embed-twitter-dark-mode"]');
//       const alignInputs = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="embed-twitter-align"]'));
//       if(urlInput&&hideCards&&hideConversation&&darkMode&&Array.isArray(alignInputs)) {
//         const align = alignInputs.filter((obj) => obj.checked).map((obj) => obj.value)[0] || 'center';
//         const body = {
//           embed_type: 'tweet', 
//           url: urlInput.value,
//           hideCards: Boolean(hideCards.checked===true),
//           hideConversation: Boolean(hideConversation.checked===true),
//           useDarkMode: Boolean(darkMode.checked===true),
//           align
//         };
//         const resp = await fetch('/api/embed',{method: 'POST',body: JSON.stringify(body), headers: {'Content-Type': 'application/json'} });
//         if (resp.status!==200) throw new Error('Something went wrong embedding Tweet content.');
//         const obj = await resp.json() as TweetResponse;
//         const editor = getCurrentEditor();
//         if (editor) editor.dispatchCommand(INSERT_TWEET_COMMAND,obj);
//         onEmbedSuccess(form,dialog);
//       } else throw new Error('Unable to find inputs for embedding tweet.');
//     } else if (formID==='embed-twitter-timeline-form') {
//       const timelineURL = form.querySelector<HTMLInputElement>('input[id="lex-embed-twitter-timeline-input"]');
//       const limitTweet = form.querySelector<HTMLInputElement>('input[id="tweet-limit-number"]');
//       const darkMode = form.querySelector<HTMLInputElement>('input[id="twitter-timeline-dark-mode"]');
//       const componentBorders = form.querySelector<HTMLInputElement>('input[id="twitter-timeline-border"]');
//       const noHeader = form.querySelector<HTMLInputElement>('input[id="twitter-timeline-no-header"]');
//       const noFooter = form.querySelector<HTMLInputElement>('input[id="twitter-timeline-no-footer"]');
//       const noBorders = form.querySelector<HTMLInputElement>('input[id="twitter-timeline-no-borders"]');
//       const noScrollbar = form.querySelector<HTMLInputElement>('input[id="twitter-timeline-no-scrollbar"]');
//       const transparent = form.querySelector<HTMLInputElement>('input[id="twitter-timeline-transparent"]');
//       if (timelineURL&&limitTweet&&darkMode&&componentBorders&&noHeader&&noFooter&&noBorders&&noScrollbar&&transparent){
//         const body = {
//           embed_type: 'twitter-timeline', 
//           url: timelineURL.value,
//           limit: Number(limitTweet.value),
//           darkMode: Boolean(darkMode.checked===true),
//           componentBorders: String(componentBorders.value),
//           noHeader: Boolean(noHeader.checked===true),
//           noFooter: Boolean(noFooter.checked===true),
//           noBorders: Boolean(noBorders.checked===true),
//           noScrollbar: Boolean(noScrollbar.checked===true),
//           transparent: Boolean(transparent.checked===true),
//         };
//         const resp = await fetch('/api/embed',{method: 'POST',body: JSON.stringify(body), headers: {'Content-Type': 'application/json'} });
//         if (resp.status!==200) throw new Error('Something went wrong embedding Twitter Timeline content.');
//         const obj = await resp.json() as TwitterTimelineResponse;
//         const editor = getCurrentEditor();
//         if (editor) editor.dispatchCommand(INSERT_TWITTER_TIMELINE_COMMAND,obj);
//         onEmbedSuccess(form,dialog);
//       } else throw new Error('Unable to find inputs for embedding twitter timeline.');
//     } else throw new Error('Form ID not recognized.');
    
//   } catch (error) {
//     closeLoadingDialog();
//     onEmbedError(dialog);
//   }
// }
// export type RedditResponse = {
//   html: string;
//   script: string;
//   url: string;
//   parent: boolean;
// };
// /**
//  * [Reference for Oembed](https://github.com/reddit-archive/reddit/wiki/oEmbed)
//  * @param form 
//  * @param e 
//  * @param dialog 
//  */
// async function handleEmbedReddit(form: HTMLFormElement,e:Event,dialog: HTMLDialogElement) {
//   try {
//     const url = form.querySelector<HTMLInputElement>('input[id="lex-embed-reddit-input"]');
//     const includeParent = form.querySelector<HTMLInputElement>('input[id="reddit-include-parent"]');
//     if (!!!url || !!!includeParent) throw new Error('Unable to get inputs for embedding reddit comment.');
//     const body = {
//       embed_type: 'reddit',
//       url: url.value,
//       parent: Boolean(includeParent.checked===true)
//     };
//     const resp = await fetch('/api/embed',{method:'POST',body:JSON.stringify(body),headers:{'Content-Type':'application/json'}});
//     if (resp.status!==200) throw new Error('Something went wrong embedding Reddit content.');
//     const obj = await resp.json() as RedditResponse;
//     const editor = getCurrentEditor();
//     if (editor) editor.dispatchCommand(INSERT_REDDIT_COMMENT_NODE_COMMAND,{...obj, includeParent: obj.parent});
//     onEmbedSuccess(form,dialog);
//   } catch (error) {
//     closeLoadingDialog();
//     onEmbedError(dialog);
//   }
// }
// /**
//  * [Reference for embedding instagram post](https://developers.facebook.com/docs/graph-api/reference/instagram-oembed/)
//  * 
//  * @param form 
//  * @param e 
//  * @param dialog 
//  */
// async function handleEmbedInstagram(form: HTMLFormElement,e:Event,dialog: HTMLDialogElement) {
//   onEmbedError(dialog);
//   return;
//   // try {
//   //   const url = form.querySelector<HTMLInputElement>('input[id="lex-embed-instagram-input"]');
//   //   const hideCaption = form.querySelector<HTMLInputElement>('input[id="instagram-hide-caption"]');
//   //   if (!!!url||!!!hideCaption) throw new Error('Unabel to get inputs for embedding Instagram Post.');
//   //   const body = {
//   //     embed_type:'instagram',
//   //     url: url.value,
//   //     hidecaption: Boolean(hideCaption.checked===true)
//   //   };
//   //   const resp = await fetch('/api/embed',{method:'POST',body:JSON.stringify(body),headers:{'Content-Type':'application/json'}});
//   //   if (resp.status!==200) throw new Error('Something went wrong embedding Instagram content.');

//   // } catch (error) {
//   //   closeLoadingDialog();
//   //   onEmbedError(dialog);
//   // }
// }