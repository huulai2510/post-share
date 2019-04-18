<template>
  <v-container text-xs-center>

    <!-- Loading spinner -->

    <v-layout row>
      <v-dialog v-model="loading" persistent fullscreen>
        <v-container fill-height="">
          <v-layout row justify-center align-center>
            <v-progress-circular
              indeterminate
              :size="70"
              :width="7"
              color="secondary"
            ></v-progress-circular>
          </v-layout>
        </v-container>
      </v-dialog>
    </v-layout>

    <!-- Expore Posts Button -->
    <v-layout class="mt-2 mb-3" row wrap v-if="!loading">
      <v-flex xs12>
        <v-btn class="primary lighten-2" to="/posts" large dark>
          Explore Posts
        </v-btn>
      </v-flex>
    </v-layout>

    <!-- Post Carousel -->
    <v-flex xs12>
      <v-carousel
        v-if="!loading && posts.length"
        v-bind="{ 'cycle': true }"
        interval="3000"
      >
        <v-carousel-item
          v-for="post in posts"
          :key="post._id"
          :src="post.imageUrl"
          @click.native="gotoPost(post._id)"
        >
          <h1 id="carousel__title">{{post.title}}</h1>
        </v-carousel-item>
      </v-carousel>
    </v-flex>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Home',
  created() {
    this.handleGetCarouselPosts()
  },
  computed: {
    ...mapGetters(['posts', 'loading'])
  },
  methods: {
    handleGetCarouselPosts() {
      this.$store.dispatch('getPosts')
    },
    gotoPost(postId) {
      this.$router.push(`/posts/${postId}`)
    }
  }
}
</script>
<style>
#carousel__title {
  position: absolute;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 5px 5px 0 0;
  padding: 0.5em;
  margin: 0 auto;
  bottom: 50px;
  left: 0;
  right: 0;
}
</style>
