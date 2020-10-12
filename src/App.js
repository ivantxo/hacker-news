import React from 'react';
import axios from 'axios';
import { sortBy } from 'lodash';

const API_BASE = 'https://hn.algolia.com/api/v1';
const API_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';

const useSemiPersistanceState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );
  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);
  return [value, setValue];
};

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
      
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: 
          action.payload.page === 0
            ? action.payload.list
            : state.data.concat(action.payload.list),
        page: action.payload.page,
      };

    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true
      };

    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          story => action.payload.objectID !== story.objectID
        ),
      }

    default:
        throw new Error();
  }
};

const getUrl = (searchTerm, page) => 
  `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`;

const extractSearchTerm = url => 
  url
    .substring(url.lastIndexOf('?') + 1, url.lastIndexOf('&'))
    .replace(PARAM_SEARCH, '')
    .trim();

const getLastSearches = urls =>
  urls
    .reduce((result, url, index) => {
      const searchTerm = extractSearchTerm(url);

      if (index === 0) {
        return result.concat(searchTerm);
      }

      const previousSearchTerm = result[result.length - 1];

      if (searchTerm === previousSearchTerm) {
        return result;
      } else {
        return result.concat(searchTerm);
      }
    }, [])
    .filter(searchTerm => searchTerm.trim().length > 0)
    .slice(-6)
    .slice(0, -1);

function App() {
  const [searchTerm, setSearchTerm] = useSemiPersistanceState('search', '');

  const [urls, setUrls] = React.useState([getUrl(searchTerm, 0)]);

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], page: 0, isLoading: false, isError: false }
  );

  const handleFetchStories = React.useCallback(async() => {
    const lastUrl = urls[urls.length - 1];
    const lastSearchTerm = extractSearchTerm(lastUrl);
    if (!lastSearchTerm.trim().length)
      return;
    dispatchStories({ type: 'STORIES_FETCH_INIT' });
    try {
      const result = await axios.get(lastUrl);
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: {
          list: result.data.hits,
          page: result.data.page,
        }
      });
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    }
  }, [urls]);

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleSearch = (searchTerm, page) => {
    const url = getUrl(searchTerm, page);
    if (searchTerm.trim().length)
      setUrls(urls.concat(url));
  };

  const handleSearchInput = event => {
    setSearchTerm(event.target.value);
  };

  const handleRemoveStory = item => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  };

  const handleSearchSubmit = event => {
      handleSearch(searchTerm, 0);
      event.preventDefault();
  };

  const handleLastSearch = searchTerm => {
    setSearchTerm(searchTerm);
    handleSearch(searchTerm, 0);
  };

  const lastSearches = getLastSearches(urls);

  const handleMore = () => {
    const lastUrl = urls[urls.length - 1];
    const searchTerm = extractSearchTerm(lastUrl);
    handleSearch(searchTerm, stories.page + 1);
  };

  return (
    <div>
      <h1>Hacker News</h1>
      <hr />
      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />
      <LastSearches
        lastSearches={lastSearches}
        onLastSearch={handleLastSearch}
      />
      <hr />

      {stories.isError && <p>Something went wrong...</p>}

      <List
        list={stories.data}
        onRemoveItem={handleRemoveStory}
      />

      {stories.isLoading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ marginBottom: '10px' }}>
          <button
            type="button"
            onClick={handleMore}
          >
            More...
          </button>
        </div>
      )}
    </div>
  );
}

const LastSearches = ({ lastSearches, onLastSearch }) => (
  <div style={{ display: 'flex', marginBottom: '10px' }}>
    {lastSearches.map((searchTerm, index) => (
      <button
        key={searchTerm + index}
        type="button"
        onClick={() => onLastSearch(searchTerm)}
        style={{ marginRight: '10px' }}
      >
        {searchTerm}
      </button>
    ))}
  </div>
);

const SearchForm = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit,
}) => (
  <div style={{ display: 'flex', marginBottom: '10px' }}>
    <form onSubmit={onSearchSubmit}>
      <InputWithLabel
        id="search"
        value={searchTerm}
        onInputChange={onSearchInput}
      >
        <strong>Search:</strong>
      </InputWithLabel>&nbsp;&nbsp;
      <button
        type="submit"
        disabled={!searchTerm}
      >
        Submit
      </button>
    </form>
  </div>
);

const InputWithLabel = ({ id, value, type = 'text', onInputChange, children }) => (
  <>
    <label htmlFor={id}>{children}</label>
    &nbsp;
    <input
      id={id}
      type={type}
      value={value}
      onChange={onInputChange}
    />
  </>
);

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENT: list => sortBy(list, 'num_comments'),
  POINT: list => sortBy(list, 'points'),
};

const List = ({ list, onRemoveItem }) => {
  const [sort, setSort] = React.useState({
    sortKey: 'NONE',
    isReverse: false,
  });

  const handleSort = sortKey => {
    const isReverse = sort.sortKey === sortKey && !sort.isReverse;
    setSort({ sortKey: sortKey, isReverse: isReverse });
  };

  const sortFunction = SORTS[sort.sortKey];
  const sortedList = sort.isReverse
    ? sortFunction(list).reverse()
    : sortFunction(list);

  return (
    <div>
      <SortingControls onSort={handleSort} />
      {sortedList.map((item) => (
        <Item
          key={item.objectID}
          item={item}
          onRemoveItem={onRemoveItem}
        />
      ))}
    </div>
  );
};

const SortingControls = ({ onSort }) => (
  <div style={{ display: 'flex', marginBottom: '10px' }}>
    <span style={{ width: '40%' }}>
      <button
        type="button"
        onClick={() => onSort('TITLE')}
      >
        Title&#8661;
      </button>
    </span>
    <span style={{ width: '10%' }}>
      <button
        type="button"
        onClick={() => onSort('AUTHOR')}
      >
        Author&#8661;
      </button>
    </span>
    <span style={{ width: '7%' }}>
      <button
        type="button"
        onClick={() => onSort('COMMENT')}
      >
        Comment&#8661;
      </button>
    </span>
    <span style={{ width: '7%' }}>
      <button
        type="button"
        onClick={() => onSort('POINT')}
      >
        Points&#8661;
      </button>
    </span>
  </div>
);

const Item = ({ item, onRemoveItem }) => (
  <div style={{ display: 'flex', marginBottom: '10px' }}>
    <span style={{ width: '40%' }}>
      <a href={item.url}>{item.title}</a>
    </span>
    <span style={{ width: '10%' }}>{item.author}</span>
    <span style={{ width: '7%' }}>{item.num_comments}</span>
    <span style={{ width: '7%' }}>{item.points}</span>
    <span style={{ width: '5%' }}>
      <button type="button" onClick={() => onRemoveItem(item)}>
        Dismiss
      </button>
    </span>
  </div>
);

export default App;
