/*
 * @Author: zhaojiawei 
 * @Date: 2018-12-12 11:13:32 
 * @Last Modified by: zhaojiawei
 * @Last Modified time: 2018-12-25 09:34:56
 */
/**
 * FavoriteDao
 * @flow
 */
'use strict';


import {
  AsyncStorage,
} from 'react-native';

const FAVORITE_KEY_PREFIX='favorite_'

export default class FavoriteDao{
  constructor(flag) {
    this.flag = flag;
    this.favoriteKey=FAVORITE_KEY_PREFIX+flag;
  }
  /**
   * 收藏项目
   * @param {*项目ID或者名称} key 
   * @param {*收藏的项目} vaule 
   * @param {*} callback 
   */
  saveFavoriteItem(key,vaule,callback) {
    AsyncStorage.setItem(key,vaule,(error,result)=>{
      if (!error) {//更新Favorite的key
        this.updateFavoriteKeys(key,true);
      }
    });
  }
  /**
   * 更新Favorite key集合，先取到key值,再做一些更新逻辑，再保存
   * @param isAdd true 添加,false 删除
   * **/
  updateFavoriteKeys(key,isAdd){
    AsyncStorage.getItem(this.favoriteKey,(error,result)=>{
      if (!error) {
        var favoriteKeys=[];
        if (result) {
          favoriteKeys=JSON.parse(result);
        }
        var index=favoriteKeys.indexOf(key);
        if(isAdd){
          if (index===-1)favoriteKeys.push(key);
        }else {
          if (index!==-1)favoriteKeys.splice(index, 1);
        }
        AsyncStorage.setItem(this.favoriteKey,JSON.stringify(favoriteKeys));
      }
    });
  }
  //获取收藏的Respository对应的key
  getFavoriteKeys(){
    return new Promise((resolve,reject)=>{
      AsyncStorage.getItem(this.favoriteKey,(error,result)=>{
        if (!error) {
          try {
            resolve(JSON.parse(result));
          } catch (e) {
            reject(error);
          }
        }else {
          reject(error);
        }
      });
    });
  }
  //取消收藏
  removeFavoriteItem(key) {
    AsyncStorage.removeItem(key,(error,result)=>{
      if (!error) {
        this.updateFavoriteKeys(key,false);
      }
    });
  }
/**
 * 获取用户所收藏的项目
 */
  getAllItems() {
    return new Promise((resolve,reject)=> {
      this.getFavoriteKeys().then((keys)=> {
        var items = [];
        if (keys) {
          //获取key的集合下的数据
          AsyncStorage.multiGet(keys, (err, stores) => {
            try {
              stores.map((result, i, store) => {
                // get at each store's key/value so you can work with it
                let key = store[i][0];
                let value = store[i][1];
                if (value)items.push(JSON.parse(value));
              });
              resolve(items);
            } catch (e) {
              reject(e);
            }
          });
        } else {
          resolve(items);
        }
      }).catch((e)=> {
        reject(e);
      })
    })
  }
}

