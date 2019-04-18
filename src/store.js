import Vue from 'vue'
import Vuex from 'vuex'
import router from './router'

import { defaultClient as apolloClient } from './main'
import {
  GET_POSTS,
  SIGNIN_USER,
  GET_CURRENT_USER,
  SIGNUP_USER,
  ADD_POST,
  SEARCH_POSTS,
  GET_USER_POSTS,
  UPDATE_USER_POST,
  INFINITE_SCROLL_POSTS,
  DELETE_USER_POST
} from './queries'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    posts: [],
    userPosts: [],
    searchResults: [],
    user: null,
    loading: false,
    error: null,
    authError: null
  },
  getters: {
    posts: ({ posts }) => posts,
    loading: ({ loading }) => loading,
    user: ({ user }) => user,
    error: ({ error }) => error,
    authError: ({ authError }) => authError,
    userFavorites: ({ user }) => user && user.favorites,
    searchResults: ({ searchResults }) => searchResults,
    userPosts: ({ userPosts }) => userPosts
  },
  mutations: {
    SET_POSTS: (state, payload) => {
      state.posts = payload
    },
    SET_USER: (state, payload) => {
      state.user = payload
    },
    SET_LOADING: (state, payload) => {
      state.loading = payload
    },
    CLEAR_USER: state => {
      state.user = null
    },
    SET_ERROR: (state, payload) => {
      state.error = payload
    },
    CLEAR_ERROR: state => {
      state.error = null
    },
    SET_AUTH_ERROR: (state, payload) => {
      state.authError = payload
    },
    SET_SEARCH_RESULTS: (state, payload) => {
      if (payload !== null) {
        state.searchResults = payload
      }
    },
    CLEAR_SEARCH_RESULT: state => {
      state.searchResults = []
    },
    SET_USER_POSTS: (state, payload) => {
      state.userPosts = payload
    }
  },
  actions: {
    getCurrentUser: ({commit}) => {
      commit('SET_LOADING', true)
      apolloClient.query({
        query: GET_CURRENT_USER
      })
      .then(({ data }) => {
        commit('SET_LOADING', false)
        commit('SET_USER', data.getCurrentUser)
      })
      .catch(err => {
        commit('SET_LOADING', false)
        console.error(err)
      })
    },
    getPosts: ({ commit }) => {
      commit('SET_LOADING', true)
      apolloClient
      .query({
        query: GET_POSTS
      }).then(({ data }) => {
        commit('SET_LOADING', false)
        commit('SET_POSTS', data.getPosts)
      }).catch(err => {
        commit('SET_LOADING', false)
        console.error(err)
      })
    },
    signinUser: ({ commit }, payload) => {
      commit('CLEAR_ERROR')
      commit('SET_LOADING', true)
      localStorage.setItem('token', '')
      apolloClient
        .mutate({
          mutation: SIGNIN_USER,
          variables: payload
        })
        .then(({ data }) => {
          commit('SET_LOADING', false)
          localStorage.setItem('token', data.signinUser.token)
          router.go()
        })
        .catch(err => {
          commit('SET_LOADING', false)
          commit('SET_ERROR', err)
          console.error(err)
        })
    },
    signupUser: ({ commit }, payload) => {
      commit('CLEAR_ERROR')
      commit('SET_LOADING', true)
      apolloClient
        .mutate({
          mutation: SIGNUP_USER,
          variables: payload
        })
        .then(({ data }) => {
          commit('SET_LOADING', false)
          localStorage.setItem('token', data.signupUser.token)
          router.go()
        })
        .catch(err => {
          commit('SET_LOADING', false)
          commit('SET_ERROR', err)
          console.error(err)
        })
    },
    signoutUser: async ({ commit }) => {
      commit('CLEAR_USER')
      localStorage.setItem('token', '')
      await apolloClient.resetStore()
      router.push('/')
    },
    searchPosts: ({ commit }, payload) => {
      apolloClient.query({
        query: SEARCH_POSTS,
        variables: payload
      }).then(({ data }) => {
        commit('SET_SEARCH_RESULTS', data.searchPosts)
      }).catch(err => console.error(err))
    },
    getUserPosts: async ({ commit }, payload) => {
      apolloClient.query({
        query: GET_USER_POSTS,
        variables: payload
      }).then(({ data }) => {
        commit('SET_USER_POSTS', data.getUserPosts)
      }).catch(err => {
        console.error(err)
      })
    },
    addPost: async ({ commit }, payload) => {
      apolloClient
      .mutate({
        mutation: ADD_POST,
        variables: payload,
        update: (cache, { data: addPost }) => {
          const data = cache.readQuery({ query: GET_POSTS })
          data.getPosts.unshift(addPost)
          cache.writeQuery({
            query: GET_POSTS,
            data
          })
        },
        optimisticResponse: {
          __typename: 'Mutation',
          addPost: {
            __typename: 'Post',
            __id: -1,
            ...payload
          }
        },
        refetchQueries: [
          {
            query: INFINITE_SCROLL_POSTS,
            variables: {
              pageNum: 1,
              pageSize: 2
            }
          }
        ]
      })
      .then(({ data }) => {
        console.log(data)
        router.push('/')
      })
      .catch(err => {
        console.error(err)
      })
    },
    updateUserPost: ({ state, commit }, payload) => {
      return apolloClient.mutate({
        mutation: UPDATE_USER_POST,
        variables: payload
      })
      .then(({ data }) => {
        const index = state.userPosts.findIndex(post => post._id === data.updateUserPost._id)
        const userPosts = [
          ...state.userPosts.slice(0, index),
          data.updateUserPost,
          ...state.userPosts.slice(index + 1)
        ]
        commit('SET_USER_POSTS', userPosts)
      }).catch(err => {
        console.error(err)
      })
    },
    deleteUserPost: ({ commit, state }, payload) => {
      apolloClient.mutate({
        mutation: DELETE_USER_POST,
        variables: payload
      }).then(({ data }) => {
        console.log(data)
        const index = state.userPosts.findIndex(post => post._id === data.deleteUserPost._id)
        const userPosts = [
          ...state.userPosts.slice(0, index),
          ...state.userPosts.slice(index + 1)
        ]
        commit('SET_USER_POSTS', userPosts)
      }).catch(err => {
        console.error(err)
      })
    }
  }
})
