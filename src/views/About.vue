<template>
  <div class="about">
    <h1>This is an about page</h1>

    <AddTutorial />
  </div>
</template>

<script>
// @ is an alias to /src
import AddTutorial from '@/components/AddTutorial.vue';

export default {
  name: 'Home',
  components: {
    AddTutorial,
  },
};
</script>
