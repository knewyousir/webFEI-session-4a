const nav = document.getElementById('main');
const navbar = nav.querySelector('.navitems');
const siteWrap = document.querySelector('.site-wrap');

// fix the navigation to the top of the page

let topOfNav = nav.offsetTop;

function fixNav() {
  if(window.scrollY >= topOfNav) {
    document.body.style.paddingTop = nav.offsetHeight + 'px';
    document.body.classList.add('fixed-nav');
  } else {
    document.body.classList.remove('fixed-nav');
    document.body.style.paddingTop = 0;
  }
}

// Show and hide the navigation

const logo = document.querySelector('.logo')

logo.addEventListener('click', showMenu);

function showMenu(e) {
  document.body.classList.toggle('show');
  const navLinks = document.querySelectorAll('.navitems a');
  navLinks.forEach(link => link.addEventListener('click', dump))
  e.preventDefault();
}

function dump(){
  document.body.classList.toggle('show');
}

// CONTENT

function init() {
  // let newloc = location.hash.substr(1);
  fetchLab((content) => {
    
    const markup =
    `<ul>
    ${content.map(
      listItem => `<li><a href="#${listItem._id.$oid}">${listItem.title}</a></li>`
    ).join('')}
    </ul>`;
    navbar.innerHTML = markup;
    
    let generatedContent = '';
    for (let i = 0; i < content.length; i++){
      generatedContent += `
      <div class="recipe-preview">
      <h2><a href="recipe/${content[i]._id}">${content[i].title}</a></h2>
      <img src="/img/recipes/${content[i].image}" />
      <p>${content[i].description}</p>
      <span onclick="deleteme('${content[i]._id}')">✖︎</span>
      </div>
      `
    }
    siteWrap.innerHTML = generatedContent;
    
    const newLinks = document.querySelectorAll('.site-wrap h2 a')
    newLinks.forEach( link => link.addEventListener('click', detailme) )
  })
}

// NEW function for getting data - uses fetch and promises

const ApiUrl = 'http://localhost:3002/api/recipes';

function fetchLab(callback) {
  // fetch('https://api.mlab.com/api/1/databases/recipes-dd/collections/recipes?apiKey=oZ92RXFzah01L1xNSWAZWZrm4kn6zF0n')
  fetch(ApiUrl)
  // .then( res => console.log(res) )
  .then( res => res.json() )
  // .then( res => console.log(res) )
  .then( data => callback(data) )
}

init();

window.addEventListener('scroll', fixNav);

function deleteme(thingtodelete) {
  fetch(`${ApiUrl}/${thingtodelete}`, {
    method: 'delete'
  })
  .then(response=> response.json())
  .then(location.href = '/')
  .catch(err => {
    console.error(err);
  })
}

function fetchOne(recipeId, callback) {
  // let id = this.getAttribute('href');
  // console.log(`${ApiUrl}/${recipeId}`)
  fetch(`${ApiUrl}/${recipeId}`, {
    method: 'get'
  })
  .then(response => response.json())
  // .then(res => console.log(res))
  .then(data => callback(data))
}

function detailme() {
  // event.preventDefault();
  let recipeId = this.getAttribute('href').substring(7);
  // console.log(recipeId)
  fetchOne(recipeId, (content) => {
    // console.log('content '+content.title)
    let singleRecipeContent = `
      <div class="recipe-preview">
      <h2>Recipe for ${content.title}</h2>
      <img src="/img/recipes/${content.image}" />
      <h2>Ingredients</h2>
      <ul>
      <li>${content.ingredients[0]}</li>
      <li>${content.ingredients[1]}</li>
      <li>${content.ingredients[2]}</li>
    </ul>
    <h2>Instructions</h2>
      <ul>
        <li>${content.preparation[0].step}</li>
        <li>${content.preparation[1].step}</li>
        <li>${content.preparation[2].step}</li>
      </ul>
      </div>
    `
    siteWrap.innerHTML = singleRecipeContent;
  })
  event.preventDefault();
}

// const addForm = document.querySelector('form');
// addForm.addEventListener('submit', doFormStuff)

// function doFormStuff() {
//   console.log('hit')
//   fetch(`${ApiUrl}`, {
//     method: 'post'
//   })
//   event.preventDefault();
// }