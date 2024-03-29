<template>
  <v-container class="text-xs-center">

    <!-- User Details Card -->
    <v-flex sm6 offset-sm3>
      <v-card class="white--text" color="primary darken-2">
        <v-layout>
          <v-flex xs5 class="pt-3">
            <v-img height="125px" contain :src="user.avatar"></v-img>
          </v-flex>
          <v-flex xs7>
            <v-card-title primary-title>
              <div>
                <div class="headline">{{user.username}}</div>
                <div>Joined {{formatJoinDate(user.joinDate)}}</div>
                <div class="hidden-xs-only font-weight-regular">Post favorites: {{user.favorites.length}}</div>
                <div class="hidden-xs-only font-weight-regular">{{userPosts.length}} Posts Added</div>
              </div>
            </v-card-title>
          </v-flex>
        </v-layout>
      </v-card>
    </v-flex>
    
    <!-- Posts Favorited By User -->
    <v-layout row wrap v-if="!userFavorites.length">
      <v-flex xs12>
        <h2> You have no favorites currently. Go and add some</h2>
      </v-flex>
    </v-layout>
    <v-container class="mt-3" v-else>
      <v-flex xs12>
        <h2 class="font-weight-light">Favorited
          <span class="font-weight-regular">{{userFavorites.length}}</span>
        </h2>
      </v-flex>
      <v-layout row wrap>
        <v-flex xs12 sm6 v-for="favorite in userFavorites" :key="favorite._id">
          <v-card class="mt-3 ml-1 mr-2" hover>
            <v-img @click="goToPost(favorite._id)" height="30vh" :src="favorite.imageUrl"></v-img>
            <v-card-text>{{favorite.title}}</v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <!-- Posts Created By User -->
    <v-container v-if="!userPosts.length">
      <v-layout row wrap>
        <v-flex xs12>
          <h2>You have no posts currently. Go and add some!</h2>
        </v-flex>
      </v-layout>
    </v-container>

    <v-container class="mt-3" v-else>
      <v-flex xs12>
        <h2 class="font-weight-light">Your Posts
          <span class="font-weight-regular">({{userPosts.length}})</span>
        </h2>
      </v-flex>
      <v-layout row wrap>
        <v-flex xs12 sm6 v-for="post in userPosts" :key="post._id">
          <v-card class="mt-3 ml-1 mr-2" hover>
            <v-btn
              color="info"
              @click="loadPost(post)"
              floating fab small dark
              >
              <v-icon>edit</v-icon>
            </v-btn>
            <v-btn
              @click="handleDeleteUserPost(post)"
              color="error"
              floating fab small dark
            >
              <v-icon>delete</v-icon>
            </v-btn>

            <v-img @click="goToPost(post._id)" height="30vh" :src="post.imageUrl"></v-img>
            <v-card-text>{{post.title}}</v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <!-- Edit Post Dialog -->
    <v-dialog xs12 sm6 offset-sm3 persistent v-model="editPostDialog">
      <v-card>
        <v-card-title class="headline grey lighten-2">Update Post</v-card-title>
        <v-container>
          <v-form
            v-model="isFormValid"
            lazy-validation
            ref="form"
            @submit.prevent="handleUpdateUserPost()"
          >
            <!-- Title Input -->
            <v-layout row>
              <v-flex xs12>
                <v-text-field
                  v-model="title"
                  label="Post Title"
                  type="text"
                  required
                  :rules="titleRules"
                ></v-text-field>
              </v-flex>
            </v-layout>

            <!-- Image Input -->
            <v-layout row>
              <v-flex xs12>
                <v-text-field
                  v-model="imageUrl"
                  label="Image URL"
                  type="text"
                  required
                  :rules="imageRules"
                ></v-text-field>
              </v-flex>
            </v-layout>

            <!-- Image Preview -->
            <v-layout row>
              <v-flex xs12>
                <img :src="imageUrl" height="300px" />
              </v-flex>
            </v-layout>

            <!-- Category Select -->
            <v-layout row>
              <v-flex xs12>
                <v-select
                  v-model="categories"
                  :items="['Art', 'Education', 'Travel', 'Photography', 'Technology', 'Food']"
                  multiple
                  label="Categories"
                  :rules="categoriesRules"
                ></v-select>
              </v-flex>
            </v-layout>

            <!-- Description Text Area -->
            <v-layout row>
              <v-flex xs12>
                <v-textarea
                  :rules="descRules"
                  v-model="description"
                  label="Description"
                  type="text"
                  required
                ></v-textarea>
              </v-flex>
            </v-layout>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn :disabled="!isFormValid" type="Submit" class="success--text" flat>Update</v-btn>
              <v-btn class="error-text" flat @click="editPostDialog = false">Cancel</v-btn>
            </v-card-actions>
          </v-form>
        </v-container>

      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
import { mapGetters } from 'vuex';
import moment from 'moment';

export default {
  name: 'Profile',
  data() {
    return {
      editPostDialog: false,
      isFormValid: true,
      title: '',
      imageUrl: '',
      categories: [],
      description: '',
      titleRules: [
        v => !!v || 'Title is required',
        v => v.length < 20 || 'Title must have less than 20 characters'
      ],
      imageRules: [
        v => !!v || 'image is required'
      ],
      categoriesRules: [
        v => v.length > 0 || 'At least one category is required'
      ],
      descRules: [
        v => !!v || 'Description is required',
        v => v.length < 200 || 'Description must have less than 200 characters'
      ]
    }
  },
  computed: {
    ...mapGetters(['user', 'userFavorites', 'userPosts'])
  },
  created() {
    this.handleGetUserPosts()
  },
  methods: {
    goToPost(postId) {
      this.$router.push(`/posts/${postId}`)
    },
    formatJoinDate(date) {
      return moment(new Date(date)).format('ll')
    },
    handleGetUserPosts() {
      this.$store.dispatch('getUserPosts', {
        userId: this.user._id
      })
    },
    handleUpdateUserPost() {
      if (this.$refs.form.validate()) {
        this.$store.dispatch('updateUserPost', {
          postId: this.postId,
          userId: this.user._id,
          title: this.title,
          imageUrl: this.imageUrl,
          categories: this.categories,
          description: this.description
        })
        this.editPostDialog = false
      }
    },
    loadPost({ _id, title, imageUrl, categories, description }) {
      this.editPostDialog = true
      this.postId = _id
      this.title = title
      this.imageUrl = imageUrl
      this.categories = categories
      this.description = description
    },
    handleDeleteUserPost({ _id }) {
      const deletePost = window.confirm('Are you sure you want to delete this post?')
      if (deletePost) {
        this.$store.dispatch('deleteUserPost', { postId: _id })

      }
    }
  }
}
</script>
