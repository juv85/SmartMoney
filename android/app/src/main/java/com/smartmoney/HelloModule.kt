package com.smartmoney 

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class HelloModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "HelloModule"
    }

    @ReactMethod
    fun sayHello(promise: Promise) {
        promise.resolve("Hello from Kotlin again!")
    }
}
