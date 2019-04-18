<template>
  <v-container text-xs-center mt-5 pt-5>
    <!-- Add Post Title  -->
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <h1>Add post</h1>
      </v-flex>
    </v-layout>

    <!-- Add Post Form -->
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <v-form
          v-model="isFormValid"
          lazy-validation
          ref="form"
          @submit.prevent="handleAddPost()"
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

          <v-layout row>
            <v-flex xs12>
              <v-btn
                :disabled="!isFormValid || loading"
                :loading="loading"
                color="success"
                type="submit"
              >
                <template v-slot:loader>
                  <span class="custom-loader">
                    <v-icon light>cached</v-icon>
                  </span>
                </template>
                Submit
              </v-btn>
            </v-flex>
          </v-layout>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'AddPost',
  data() {
    return {
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
    ...mapGetters(['loading', 'user'])
  },
  methods: {
    handleAddPost() {
      if (this.$refs.form.validate()) {
        let { title, imageUrl, categories, description, user } = this
        this.$store.dispatch('addPost',{
          title,
          imageUrl,
          categories,
          description,
          creatorId: user._id
        })
      }
    }
  }
}
</script>
