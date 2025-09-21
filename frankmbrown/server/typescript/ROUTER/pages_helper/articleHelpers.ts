import ejs from 'ejs';
import crypto from 'node:crypto';

const ejsTemplate = `<section id="<%=locals.temp_id%>" class="mt-4 block" style="width: 100%;">
    <h2 class="bold bb-thick h2 navbar-sticky-transition" style="position: sticky; top: var(--navbar-height); opacity:1; z-index: 5; background-color: var(--background); padding: 3px 0px;">
      <a href="#<%=locals.temp_id%>" class="same-page bold">
        <%=locals.monthYear%>
      </a>
    </h2>
    <div class="mt-2">
      <%-locals.innerHTML%>
    </div>
</section>`


export function renderArticlesMonthYears(arr1:{ str: string, monthYear: string}[]) {
  if (arr1.length===0) {
    return { str: '', tableOfContents: [] };
  } else {
    let currMonth = '';
    let iter = 0;
    let arriter = -1;
    const arr:{monthYear: string, innerHTML: string}[] = [];
    while (iter < arr1.length) {
      if (arr1[iter].monthYear !== currMonth) {
        arr.push({monthYear: arr1[iter].monthYear, innerHTML: arr1[iter].str });
        arriter+=1;
        currMonth = arr1[iter].monthYear;
      } else {
        arr[arriter].innerHTML = arr[arriter].innerHTML + arr1[iter].str;
      }
      iter+=1;
    }
    var finalStr = '';
    var tableOfContents:{id:string, text: string}[] = [];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].innerHTML.length) {
        let temp_id = 'month_'.concat(crypto.randomUUID());
        finalStr+= ejs.render(ejsTemplate,{
          temp_id,
          monthYear: arr[i].monthYear,
          innerHTML: arr[i].innerHTML
        })
        tableOfContents.push({ id: temp_id, text: arr[i].monthYear});
      }
    }
    return { str: finalStr, tableOfContents: tableOfContents };
  }
}

export {
  getArticleForm
} from './article_helpers/getEditArticleForm';


export {
  PreviewDiaryType,
  renderDiaryPreview,
  PreviewArticleType,
  renderArticlePreview
} from './article_helpers/handleArticlePreview';