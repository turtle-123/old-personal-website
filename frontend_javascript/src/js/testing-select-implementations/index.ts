import TomSelect from 'tom-select';
// @ts-ignore
import SlimSelect from 'slim-select';

export default function onSelectPageLoad() {
  const tom_select_inputs =  Array.from(document.querySelectorAll<HTMLSelectElement>('select[data-tom-select]:not(data-tom-registered)'));
  const nice_select_inputs = Array.from(document.querySelectorAll<HTMLSelectElement>('select[data-nice-select]'));
  const slim_select_inputs = Array.from(document.querySelectorAll<HTMLSelectElement>('select[data-slim-select]'));
  

  tom_select_inputs.forEach((inp) => {
    if (!!!inp.hasAttribute('data-tom-registered')) {
      inp.setAttribute('data-tom-registered','')
      const id = inp.id;
      const options = Array.from(inp.querySelectorAll('option'));
      const create = Boolean(inp.getAttribute('data-create')==="true");
      const maxOptions = Boolean(inp.getAttribute('data-max-options'));
      const maxItems = Boolean(inp.getAttribute('data-max-items'));
      new TomSelect(`#`+id,{
        create, 
      })
    }
    
  });
  slim_select_inputs.forEach((inp) => {
    new SlimSelect({
      select: '#'.concat(inp.id)
    })
  })
}