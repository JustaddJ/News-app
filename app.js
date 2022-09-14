// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();

const newsService = (function() {
  const apiKey = '72b823ea01784b59b8b8e62892578c72';
  const apiUrl = 'https://newsapi.org/v2';

  return {
    topHealines(country = 'us', category = 'general', cb) {
      http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`, cb);
    },
    everything(country = 'us', category = 'general', query, cb) {
      http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&q=${query}&apiKey=${apiKey}`, cb);
    }
  }
})();

//Elements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];
const categorySelect = form.elements['category'];


form.addEventListener('submit', e => {
  e.preventDefault();
  setLocalSettings(countrySelect.value, searchInput.value, categorySelect.value);
  loadNews();
});



//  init selects
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  loadNews();

    initLocalStorage(countrySelect.value, searchInput.value, categorySelect.value);
  
});

// Load news function 
function loadNews() {
  showLoader();

  let country = countrySelect.value;
  const searchText = searchInput.value;
  const category = categorySelect.value;

  if (!searchText && !localStorage.length) {
    newsService.topHealines(country, category, onGetResponse);
  } else if (!searchText && localStorage.length && !localStorage.getItem('text')) {
    newsService.topHealines(localStorage.getItem('country'), localStorage.getItem('category'), onGetResponse);
  } else if (localStorage.length && localStorage.getItem('text')) {
    newsService.everything(localStorage.getItem('country'), localStorage.getItem('category'), localStorage.getItem('text'), onGetResponse);
    searchInput.value = localStorage.getItem('text');
  } else {
    newsService.everything(country, category, searchText, onGetResponse);
  } 

}

//Local storage
function setLocalSettings(country, searchText, category) {
  localStorage.setItem('country', country);
  localStorage.setItem('text', searchText);
  localStorage.setItem('category', category);
}

function initLocalStorage(country, searchText, category) {
  if (localStorage.length) {
    const currentCategory = document.querySelector(`[value=${localStorage.getItem('category')}]`);
    currentCategory.setAttribute('selected', '');
    // countrySelect.value = localStorage.getItem('country');
  }
}

//Function on get response from server
function onGetResponse(err, res) {
  removeLoader();

  if (err) {
    showAlert(err, 'error-msg');
    return;
  }

  if (!res.articles.length) {
    M.toast({html: "Sorry, we don't have news", classes: 'rounded'});
    return;
  }

  renderNews(res.articles);
}

//Function render news
function renderNews(news) {
  const newsContainer = document.querySelector('.news-container .row');
  let fragment = '';

  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }

  news.forEach(newsItem => {
    const elem = newsTemplate(newsItem);
    fragment += elem;
  });

  newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

//Function clear container
function clearContainer(container) {
  // container innerHTML = '';

  let child = container.lastElementChild;

  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

//News item template function
function newsTemplate({ urlToImage, title, url, description }) {
  const image = changeNewsImage(urlToImage);
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img class="news-image" src="${image}">
          <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
          <p>${description || ''}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Read more</a>
        </div>
      </div>
    </div>
  `;
}

function changeNewsImage(img) {
  if (!img) {
    return 'https://golos.ua/images/items/2020-08/02/CxJ6myL6cfYB26Mn/img_top.jpg';
  } else {
    return img;
  }
}

function showAlert(msg, type = 'success') {
  M.toast({ html: msg, classes: type, classes: 'rounded' });
}

//Show loader function
function showLoader() {
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="preloader-wrapper active">
      <div class="spinner-layer spinner-red-only">
        <div class="circle-clipper left">
          <div class="circle"></div>
        </div><div class="gap-patch">
          <div class="circle"></div>
        </div><div class="circle-clipper right">
          <div class="circle"></div>
        </div>
      </div>
    </div>  
  `);
}

//Remove loader function
function removeLoader() {
  const loader = document.querySelector('.preloader-wrapper');

  if (loader) {
    loader.remove();
  }
}