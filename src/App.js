import React , { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { render } from 'react-dom';

// CSS 
const largeColumn = {
  width: '40%',
};
const midColumn = {
  width: '30%',
};
const smallColumn = {
  width: '10%',
};


const isSearched = (searchItem) => (item) => {
  if(!item.title)  {
    return false;
  }
  return !searchItem | item.title.toLowerCase().includes(searchItem.toLowerCase());
}

const Button = ( {onClick, className='', children} ) => {
  return (
    <button onClick={onClick} className={className} type="button" >
        {children}
      </button>
  );
}

const Search = ({
    searchItem,
    onChange,
    onSubmit,
    children,
  }) =>
    <form value={searchItem} onSubmit={onSubmit}>
      <input 
        type="text"
        value={searchItem}
        onChange={onChange}
      />
      <button type="submit">
        {children}
      </button>
    </form>


const Table = ( {searchItem, result, close} ) => {
  return (
      <div className="table">
        {
          result.filter(isSearched(searchItem)).map( item =>
          //result.map( item =>
            <div key={item.objectID} className="table-row">
              <span style={ largeColumn }> <a href = {item.url} > {item.title } </a></span>              
              <span style={ midColumn }> {item.author}</span>
              <span style={ smallColumn }> {item.num_comments} </span>
              <span style={ smallColumn }> {item.points} </span>
              <span style={ smallColumn }>
                <Button onClick={() => close( item.objectID )} className="button-inline" >
                  Dismiss
                </Button>
              </span>
            </div>
          )
        }
      </div>
  );
}

const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const DEFAULT_PAGE = 0;



class App extends Component {
  constructor( props ) {
    super(props);
    this.state = {
      searchItem : DEFAULT_QUERY,
      result : null,
      page : DEFAULT_PAGE,
    };
    this.close = this.close.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
  }

  setSearchTopStories( result, whichPage ) {
    this.setState({page : whichPage});
    const oldResult = this.state.result ? this.state.result : [];
    const mergedResult = [
      ...oldResult,
      ...result,
    ];
    this.setState({result : mergedResult});
  }

  fetchSearchTopStories(searchItem, whichPage ) {
    const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchItem}&${PARAM_PAGE}${whichPage}`;
    console.log("fetchSearchTopStories url: " + url);
    fetch(url)
      .then( response => response.json())
      .then( result => this.setSearchTopStories(result.hits, whichPage) );
  }

  componentDidMount() {
    const { searchItem } = this.state;
    this.fetchSearchTopStories( searchItem, DEFAULT_PAGE );
  }

  close( objectID ) {
    const isNotId = item => item.objectID !== objectID;
    const updatedResult = this.state.result.filter(isNotId);
    this.setState( { result : updatedResult } );
  }

  onSearchChange( event ) {
    this.setState({searchItem : event.target.value });
  }

  onSearchSubmit(event) {
     const { searchItem } = this.state;
     this.setState( {result : []});
     this.fetchSearchTopStories( searchItem, DEFAULT_PAGE );
     event.preventDefault();
  }

  render(){
    const {searchItem, result, page} = this.state;
    return (
      <div className="page">
        <div className="interactions">
          < Search 
            searchItem={searchItem}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search list
          </Search>
        </div>
        { result ? 
          < Table 
            searchItem={searchItem}
            result={result}
            close={this.close}
          /> : null 
        }
        <div className="interactions">
          <Button onClick={() => this.fetchSearchTopStories(searchItem, page+1)}>
            More
          </Button>
        </div>
      </div>
    );
  }
}

export default App;
