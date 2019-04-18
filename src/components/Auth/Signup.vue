<template>
  <v-container text-xs-center mt-5 pt-5>
    <!-- Signup Title  -->
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <h1>Get started here</h1>
      </v-flex>
    </v-layout>

    <!-- Error Alert -->
    <v-layout v-if="error" row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <form-alert :message="error.message"/>
      </v-flex>
    </v-layout>

    <!-- Signup Form -->
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <v-card color="deep-purple darken-2" dark>
          <v-container>
            <v-form
              v-model="isFormValid"
              lazy-validation
              ref="form"
              @submit.prevent="handleSignupUser()"
            >
              <v-layout row>
                <v-flex xs12>
                  <v-text-field
                    v-model="username"
                    prepend-icon="face"
                    label="Username"
                    type="text"
                    required
                    :rules="usernameRules"
                  ></v-text-field>
                </v-flex>
              </v-layout>

              <v-layout row>
                <v-flex xs12>
                  <v-text-field
                    v-model="email"
                    prepend-icon="email"
                    label="Email"
                    type="email"
                    required
                    :rules="emailRules"
                  ></v-text-field>
                </v-flex>
              </v-layout>

              <v-layout row>
                <v-flex xs12>
                  <v-text-field
                    v-model="password"
                    prepend-icon="extension"
                    label="Password"
                    type="password"
                    required
                    :rules="passwordRules"
                  ></v-text-field>
                </v-flex>
              </v-layout>

              <v-layout row>
                <v-flex xs12>
                  <v-text-field
                    v-model="passwordConfirm"
                    prepend-icon="gavel"
                    label="Confirm Password"
                    type="password"
                    required
                    :rules="passwordRules"
                  ></v-text-field>
                </v-flex>
              </v-layout>

              <v-layout row>
                <v-flex xs12>
                  <v-btn :disabled="!isFormValid || loading" :loading="loading" color="success" type="submit">
                    <template v-slot:loader>
                      <span class="custom-loader">
                        <v-icon light>cached</v-icon>
                      </span>
                    </template>
                    Signup</v-btn>
                  <h3>
                    Already have an account?
                    <router-link to="/signin">Signin</router-link>
                  </h3>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Signup',
  data() {
    return {
      isFormValid: true,
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
      usernameRules: [
        v => !!v || 'Username is required',
        v => v.length <= 10 || "Username cannot be more than 10 characters"
      ],
      emailRules: [
        v => !!v || 'Email is required',
        v => /.@+/.test(v) ||'Email must be valid'
      ],
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.length >=4 || 'Password must be at least 4 characters',
        v => v === this.password || 'Must be match'
      ]
    }
  },
  watch: {
    user(val) {
      if (val) {
        this.$router.push('/')
      }
    }
  },
  computed: {
    ...mapGetters(['error', 'loading', 'user'])
  },
  methods: {
    handleSignupUser() {
      if (this.$refs.form.validate()) {
        let { username, email, password } = this
        this.$store.dispatch('signupUser', {
          username,
          email,
          password
        })
      }
    }
  }
}
</script>
