<template>
  <div class="home">
    <Login></Login>
  </div>
</template>

<script setup lang="ts">
import Login from '@/components/Login/index.vue';

</script>
<style lang="scss">
.home {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2c2e30;
  margin-top: -10vh;
}
</style>
