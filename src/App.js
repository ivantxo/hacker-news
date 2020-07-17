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
  return (
    <div>
      <h1>Hacker News</h1>
      <hr />
      <label htmlFor="search">Search: </label>
      <input id="search" type="text" />
      <hr />
      <List list={stories} />
    </div>
  );
}

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
