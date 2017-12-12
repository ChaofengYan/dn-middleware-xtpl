const xtpl = require('xtpl');
const path = require('path');
const mkdirp = require('mkdirp');

/**
 * 这是一个标准的中间件工程模板
 * @param {object} opts cli 传递过来的参数对象 (在 pipe 中的配置)
 * @return {AsyncFunction} 中间件函数
 */
module.exports = function (opts) {
  let {source,target,scope,watch} = opts;
  //默认渲染参数
  let _defaultOption = {
    $page:{
      env:'development'
    }
  };
  //外层函数的用于接收「参数对象」
  //必须返回一个中间件处理函数
  return async function (next) {

    if(!source||!target) return next();

    source = path.resolve(this.cwd, source);
    target = path.resolve(this.cwd, target);
    scope = typeof scope=='function'?scope():scope;

    this.console.log('source:', source);
    this.console.log('target:', target);
    this.console.log('scope:',scope);

    //渲染
    const renderFile = ()=>{
      xtpl.renderFile(source,
        Object.assign(_defaultOption,scope),
        async (error,content)=>{
          if(error) this.console.log('error:',error);
          let dstDir = path.dirname(target);
          await mkdirp(dstDir);
          await this.utils.writeFile(target, content);
        }
      );
    }
        
    renderFile();
    if(watch) this.exec({name:'watch', match: watch, onChange: renderFile});

    next();
  };

};