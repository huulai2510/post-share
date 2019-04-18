<template>
  <v-app style="background: #E3E3EE">
    <!-- side Navbar -->
    <v-navigation-drawer app temporary fixed v-model="sideNav">
      <v-toolbar color="accent" dark flat>
        <v-toolbar-side-icon @click="toggleSideNav()"></v-toolbar-side-icon>
        <router-link to="/" tag="span" style="cursor: pointer">
          <h1 class="title pl-3">PixelShare</h1>
        </router-link>
      </v-toolbar>

      <v-divider></v-divider>

      <!-- sidebar link -->
      <v-list>
        <v-list-tile v-for="item in sideNavItems" :key="item.title" :to="item.link">
          <v-list-tile-action>
            <v-icon>{{item.icon}}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-content>
              {{item.title}}
            </v-list-tile-content>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile v-if="user" @click="handleSignout()">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>Sign out</v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <!-- Horizontal Navbar -->
    <v-toolbar fixed color="primary" dark>
      <v-toolbar-side-icon @click="toggleSideNav()"></v-toolbar-side-icon>
      <v-toolbar-title class="hidden-xs-only">
        <router-link to="/" tag="span" style="cursor: pointer">
          VueShare
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>

        <!-- search input -->
        <v-text-field
          v-model="searchTerm"
          @input="handleSearchPosts()"
          flex prepend-icon="search"
          placeholder="search posts"
          color="accent"
          single-line
          hide-details
        >
        </v-text-field>

        <!-- Search Results Card -->
        <v-card v-if="searchResults.length" id="search__card">
          <v-list>
            <v-list-title
              v-for="result in searchResults"
              :key="result._id"
              @click="gotoSearchResult(result._id)"
            >
              <v-card class="pa-2">
                <v-layout>
                  <v-flex xs5>
                    <v-img :src="result.imageUrl" height="100px" width="150px"></v-img>
                  </v-flex>
                  <v-flex xs6>
                    <v-list-tile-title class="headline mb-2">
                      {{result.title}}
                    </v-list-tile-title>
                    <span class="font-weight-thin">{{formatDescription(result.description)}}</span>
                  </v-flex>
                  <v-flex xs1>
                    <!-- Show Icon If Result Favorited By User -->
                    <v-list-tile-action v-if="checkIfUserFavorite(result._id)">
                      <v-icon>favorite</v-icon>
                    </v-list-tile-action>
                  </v-flex>
                </v-layout>

              </v-card>
              <v-divider></v-divider>
            </v-list-title>
          </v-list>
        </v-card>

        <v-spacer></v-spacer>

        <!-- Horizontal Navbar Links -->
        <v-toolbar-items class="hidden-xs-only">
          <v-btn flat v-for="item in horizontalNavItems" :key="item.title" :to="item.link">
            <v-icon class="hidden-sm-only" left>{{item.icon}}</v-icon>
            <span>{{item.title}}</span>
          </v-btn>

          <v-btn flat to="/profile" v-if="user">
            <v-icon class="hidden-sm-only" left>account_box</v-icon>
            <v-badge right color="blue darken-5" :class="{ 'bounce': badgeAnimated}">
              <span slot="badge" v-if="userFavorites.length">{{userFavorites.length}}</span>
              Profile
            </v-badge>
          </v-btn>

          <v-btn flat v-if="user" @click="handleSignout()">
            <v-icon class="hidden-sm-only" left>exit_to_app</v-icon>
            Sign out
          </v-btn>
        </v-toolbar-items>
    </v-toolbar>
    <main>
      <v-container class="mt-4">
        <transition name="fade">
          <router-view />
        </transition>

        <!-- Auth snackbar -->
        <v-snackbar v-model="authSnackbar" color="success" :timeout="5000" bottom left>
          <v-icon class="mr-3">check_circle</v-icon>
          <h3>You are now signed in!</h3>
          <v-btn dark flat @click="authSnackbar = false">Close</v-btn>
        </v-snackbar>

        <!-- Auth error snackbar -->
        <v-snackbar v-if="authError" v-model="authErrorSnackbar" color="red darken-2" :timeout="5000" bottom left>
          <v-icon class="mr-3">cancel</v-icon>
          <h3>{{authError.message}}</h3>
          <v-btn dark flat to="/signin" @click="authErrorSnackbar = false">Signin</v-btn>
        </v-snackbar>
      </v-container>
    </main>
  </v-app>
</template>
<script>
import { mapGetters } from 'vuex'
import { setTimeout } from 'timers';

export default {
  name: 'App',
  data() {
    return {
      badgeAnimated: false,
      sideNav: false,
      authSnackbar: false,
      authErrorSnackbar: false,
      searchTerm: '',
      showSearchResults: false
    }
  },
  watch: {
    user(newVal, oldVal) {
      if (oldVal === null) {
        this.authSnackbar = true
      }
    },
    authError(val) {
      if (val !== null) {
        this.authErrorSnackbar = true
      }
    },
    userFavorites(val) {
      if (val) {
        this.badgeAnimated = true
        setTimeout(() => (this.badgeAnimated = false), 1000)
      }
    }
  },
  computed: {
    ...mapGetters(['authError', 'user', 'userFavorites', 'searchResults']),
    horizontalNavItems() {
      let items = [
        {icon: 'chat', title: 'Posts', link: '/posts'},
        {icon: 'lock_open', title: 'Sign In', link: '/signin'},
        {icon: 'create', title: 'Sign Up', link: '/signup'}
      ]
      if (this.user) {
        items = [
          {icon: 'chat', title: 'Posts', link: '/posts'}
        ]
      }
      return items
    },
    sideNavItems() {
      let items = [
        {icon: 'chat', title: 'Posts', link: '/posts'},
        {icon: 'lock_open', title: 'Sign In', link: '/signin'},
        {icon: 'create', title: 'Sign Up', link: '/signup'}
      ]
      if (this.user) {
        items = [
          {icon: 'chat', title: 'Posts', link: '/posts'},
          {icon: 'stars', title: 'Create Post', link: '/post/add'},
          {icon: 'account_box', title: 'Profile', link: '/profile'}
        ]
      }
      return items
    }
  },
  methods: {
    toggleSideNav() {
      this.sideNav = !this.sideNav
    },
    handleSignout() {
      this.$store.dispatch('signoutUser')
    },
    handleSearchPosts() {
      let { searchTerm } = this
        this.$store.dispatch('searchPosts', { searchTerm })
    },
    gotoSearchResult(postId) {
      this.searchTerm = ''
      this.$router.push(`/posts/${postId}`)
      this.$store.commit('CLEAR_SEARCH_RESULT')
    },
    formatDescription(desc) {
      return desc.length > 15 ? `${desc.slice(0, 15)}...` : desc
    },
    checkIfUserFavorite(postId) {
      return (
        this.userFavorites &&
        this.userFavorites.some(fave => fave._id === postId)
      )
    }
  }
}
</script>
<style>
h1 {
  font-weight: 400;
  font-size: 2.5rem;
}

h2 {
  font-weight: 400;
  font-size: 2rem;
}

.fade-enter-active,
.fade-leave-active {
  transition-property: all;
  transition-duration: 0.25s;
}

.fade-enter-active {
  transition-delay: 0.25s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
  transform: translateY(-25px);
}

.bounce {
  animation: bounce 1s both;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -20px, 0);
  }
  70% {
    transform: translate3d(0, -10px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}

#search__card {
  position: absolute;
  width: 35%;
  z-index: 8;
  top: 100%;
  left: 25%;
}
</style>
