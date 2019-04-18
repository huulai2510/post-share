<template>
  <v-alert
    typ="error"
    :value="true"
    transition="scale-transition"
    dismissible
  >
    <h3>{{message}}</h3>
  </v-alert>
</template>
<script>
export default {
  name: 'FormAlert',
  props: {
    message: String
  }
}
</script>
