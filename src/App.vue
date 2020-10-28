<template>
  <div id="app">
    <el-container>
      <el-header>图片标注平台
        <el-button type="primary" icon="el-icon-s-custom" class="person"></el-button>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-container{
  height:100vh;
}

/deep/ .el-header, .el-footer {
  background-color: #B3C0D1;
  color: #333;
  text-align: left;
  line-height: 60px;
  font-size:30px;
  height: auto;
}

/deep/ .el-main {
  background-color: #E9EEF3;
  color: #333;
  text-align: center;
  height: inherit;
  display:flex;
  justify-content: center;
  align-items:center;
  padding:0;
  margin:0;
}

/deep/ body > .el-container {
  margin-bottom: 100px;
}
.person{
  float: right;
  color:black;
  border-color:transparent;
  font-size:4.0vh;
  background-color: #B3C0D1;
  line-height:35px;
}
</style>
