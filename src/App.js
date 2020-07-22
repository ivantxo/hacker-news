import React from 'react';

const initialStories = [
  {
    title: 'React',
    url: 'https://reactjs.org',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
  {
    title: 'PHP',
    url: 'https://php.net',
    author: 'Rasmus Lerdorf',
    num_comments: 10,
    points: 10,
    objectID: 2,
  },
];

const getAsyncStories = () =>
  new Promise(resolve =>
      setTimeout(
        () => resolve({ data: { stories: initialStories}}),
        2000
      )
  );

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
    case 'SET_STORIES':
      return action.payload;

    case 'REMOVE_STORY':
      return state.filter(
        story => action.payload.objectID !== story.objectID
      );

    default:
        throw new Error();
  }
};

function App() {
  const [searchTerm, setSearchTerm] = useSemiPersistanceState('search', '');

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    []
  );

  const [isLoading, setIsLoading] = React.useState(false);

  const [isError, setIsError] = React.useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    getAsyncStories()
      .then(result => {
        dispatchStories({
          type: 'SET_STORIES',
          payload: result.data.stories,
        });
        setIsLoading(false);
      })
      .catch(() => setIsError(true));
  }, []);

  const handleSearch = event => {
    setSearchTerm(event.target.value);
  };

  const handleRemoveStory = item => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  };

  const searchedStories = stories.filter(story => {
    return story.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <h1>Hacker News</h1>
      <hr />
      <InputWithLabel
        id="search"
        value={searchTerm}
        onInputChange={handleSearch}
      >
        <strong>Search:</strong>
      </InputWithLabel>
      <hr />
      {isError ? (
        <p>Something went wrong...</p>
      ) : (
        isLoading ? (
          <p>Loading...</p>
        ) : (
          <List
            list={searchedStories}
            onRemoveItem={handleRemoveStory}
          />
        )
      )}
    </div>
  );
}

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

const List = ({ list, onRemoveItem }) =>
  list.map((item) => (
    <Item 
      key={item.objectID} 
      item={item} 
      onRemoveItem={onRemoveItem}
    />)
  );

const Item = ({ item, onRemoveItem }) => (
  <div style={{ display: 'flex', marginBottom: '10px' }}>
    <span style={{ width: '20%' }}>
      <a href={item.url}>{item.title}</a>
    </span>
    <span style={{ width: '20%' }}>{item.author}</span>
    <span style={{ width: '10%' }}>{item.num_comments}</span>
    <span style={{ width: '10%' }}>{item.points}</span>
    <span>
      <button type="button" onClick={() => onRemoveItem(item)}>
        Dismiss
      </button>
    </span>
  </div>
);

export default App;
