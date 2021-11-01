pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

pub mod convert {
    pub fn convert_f64_to_i64(x: f64) -> i64 {
        x as i64
    }
}

pub mod check {
    use crate::JsonValue;
    pub fn for_array_property(json: &JsonValue, property: &str) -> bool {
        return JsonValue::is_array(&json["schema"][property]);
    }
    pub fn for_number_property(json: &JsonValue, property: &str) -> bool {
        return JsonValue::is_number(&json["schema"][property]);
    }
}
