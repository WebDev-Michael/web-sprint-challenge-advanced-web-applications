import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import PrivateRoute from './PrivateRoute'

import axiosWithAuth from '../axios'
import axios from 'axios'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [currentArticle, setCurrentArticle] = useState(null)
  const [spinnerOn, setSpinnerOn] = useState(false)

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate()
  const redirectToLogin = () => { /* ✨ implement */ 
    navigate('/');
  }
  const redirectToArticles = () => { /* ✨ implement */ 
    navigate('/articles')
  }

  const logout = () => {
    // ✨ implement
    // If a token is in local storage it should be removed,
    // and a message saying "Goodbye!" should be set in its proper state.
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
    localStorage.removeItem('token');
    setMessage('Goodbye!');
    redirectToLogin();
  }

  const login = ({ username, password }) => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch a request to the proper endpoint.
    // On success, we should set the token to local storage in a 'token' key,
    // put the server success message in its proper state, and redirect
    // to the Articles screen. Don't forget to turn off the spinner!
    setMessage("")
    setSpinnerOn(true)
    axios.post(loginUrl, {username, password})
    .then(res=> {
      localStorage.setItem('token', res.data.token)
      setSpinnerOn(false)
      redirectToArticles()
    })
    .catch(err=> {
      console.error(err);
    })
  }

  const getArticles = () => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
    setMessage('')
    setSpinnerOn(true)
    axiosWithAuth().get(articlesUrl)
    .then(res=> {
      setArticles(res.data.articles)
      setMessage(res.data.message)
    })
    .catch(err=> {
      if (err.response.status === 401) {
        redirectToLogin()
      } else {
        console.error(err)
      }
    })
    .finally(()=>{
      setSpinnerOn(false)
    })
  }

  const postArticle = article => {
    // ✨ implement
    // The flow is very similar to the `getArticles` function.
    // You'll know what to do! Use log statements or breakpoints
    // to inspect the response from the server.
    setMessage('')
    setSpinnerOn(true)
    axiosWithAuth().post(articlesUrl, article)
    .then(res=> {
      setArticles([...articles, res.data.article])
      setMessage(res.data.message)
    })
    .catch(err=>{
      if(err.response.status === 401) {
        navigate('/articles')
      } else {
        console.error(err)
      }
    })
    .finally(()=>{
      setSpinnerOn(false)
    })
  }

  const updateArticle = ({ article_id, article }) => {
    // ✨ implement
    // You got this!
    // console.log(article_id);
    setCurrentArticle({ title: '', text: '', topic: '' });
    axiosWithAuth()
      .put(`${articlesUrl}/${article_id}`, article)
      .then((res) => {
        setMessage(res.data.message);
        const articlesCopy = [...articles];
        const index = articlesCopy.findIndex(
          (x) => x.article_id === article_id
        );
        articlesCopy[index] = article;
        setArticles(articlesCopy);
      })
      .catch((err) => {
        console.log(`ERROR IN updateArticle: ${err}`);
      });
  }

  const deleteArticle = article_id => {
    // ✨ implement
    setMessage('')
    setSpinnerOn(true)
    axiosWithAuth().delete(`${articlesUrl}/${article_id}`)
    .then(res => {
      setArticles(articles.filter(article => {
        return(article.article_id != article_id)
      }))
      setMessage(res.data.message)
    })
    .catch (err=>{
      console.error(err)
    })
    .finally(()=>{
      setSpinnerOn(false)
    })
  }

  const extractArticle = (article_id, title, text, topic) => {
    setCurrentArticle({
      article_id,
      title,
      text,
      topic,
    });
  };

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
      <Spinner on={spinnerOn}/>
      <Message message={message}/>
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm setMessage={setMessage} setSpinnerOn={setSpinnerOn} login={login}/>} />
          <Route path="/articles" element={<PrivateRoute />}>
            <Route path='/articles' element={
            <>
              <ArticleForm 
                postArticle={postArticle}
                updateArticle={updateArticle}
                setCurrentArticleId={setCurrentArticleId}
                currentArticle={articles.find(article=> article.article_id === currentArticleId)}
                />
              <Articles 
                getArticles={getArticles}
                articles={articles}
                deleteArticle={deleteArticle}
                setCurrentArticleId={setCurrentArticleId}
                extractArticle={extractArticle}
              />
            </>
            }
           />
        </Route>
        </Routes>
        <footer>Bloom Institute of Technology 2022</footer>
      </div>
    </>
  )
}
