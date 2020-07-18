import React from 'react';

const stories = [
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

function App() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = event => {
    setSearchTerm(event.target.value);
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
      <SearchForm onSearch={handleSearch} search={searchTerm} />
      <hr />
      <List list={searchedStories} />
    </div>
  );
}

const SearchForm = props => {
  return (
    <div>
      <label htmlFor="search">Search: </label>
      <input 
        id="search"
        type="text"
        value={props.search}
        onChange={props.onSearch}
      />
        &nbsp;&nbsp;&nbsp;
        Searching For: <strong>{props.search}</strong>
    </div>
  );
};

const List = props =>
  props.list.map((item) => (
    <div key={item.objectID} style={{ display: 'flex', marginBottom: '10px' }}>
      <span style={{ width: '20%' }}>
        <a href={item.url}>{item.title}</a>
      </span>
      <span style={{ width: '20%' }}>{item.author}</span>
      <span style={{ width: '10%' }}>{item.num_comments}</span>
      <span style={{ width: '10%' }}>{item.points}</span>
    </div>
  ));

export default App;
