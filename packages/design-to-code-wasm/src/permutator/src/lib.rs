mod utils;
mod number;

extern crate json;

use json::JsonValue;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    fn alert(s: &str);
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_i32(s: &str, n: i32);
}

#[wasm_bindgen]
pub fn permutate(s: &str) -> String {
    let parsed = json::parse(s).unwrap();
    let data_type = String::from(parsed["schema"]["type"].to_string());

    match data_type.as_str() {
        "number" => {
            return number::permutate_number(&parsed);
        },
        _ => {
            log("non-standard JSON schema type used, check your JSON schema for validity.");
        }
    }
    
    return "Undefined".into();
}
