pub use crate::utils::convert;
pub use crate::utils::check;

use json::JsonValue;
use rand::thread_rng;
use rand::Rng;

#[derive(Debug)]
struct Boolean {
    value: bool,
}

/**
 * Gets a random number that fits within the JSON schema
 * constraints
 */
fn get_random_number(json: &JsonValue) -> String {
    let mut multiple_of_integer: i64 = 1;
    let mut minimum_integer: i64 = 0;
    let mut maximum_integer: i64 = 101;

    if check::for_number_property(json, "multipleOf") {
        let multiple_of_number: json::number::Number = JsonValue::as_number(&json["schema"]["multipleOf"]).unwrap().into();
        multiple_of_integer = convert::convert_f64_to_i64(multiple_of_number.into());
    }

    if check::for_number_property(json, "minimum") {
        let minimum_number: json::number::Number = JsonValue::as_number(&json["schema"]["minimum"]).unwrap().into();
        minimum_integer = convert::convert_f64_to_i64(minimum_number.into());
    } else if check::for_number_property(json, "exclusiveMinimum") {
        let exclusive_minimum_number: json::number::Number = JsonValue::as_number(&json["schema"]["exclusiveMinimum"]).unwrap().into();
        minimum_integer = convert::convert_f64_to_i64(exclusive_minimum_number.into()) + 1;
    }

    if check::for_number_property(json, "maximum") {
        let maximum_number: json::number::Number = JsonValue::as_number(&json["schema"]["maximum"]).unwrap().into();
        maximum_integer = convert::convert_f64_to_i64(maximum_number.into()) + 1;
    } else if check::for_number_property(json, "exclusiveMaximum") {
        let exclusive_maximum_number: json::number::Number = JsonValue::as_number(&json["schema"]["exclusiveMaximum"]).unwrap().into();
        maximum_integer = convert::convert_f64_to_i64(exclusive_maximum_number.into());
    }

    let mut rng = thread_rng();
    let random_seed: i64 = rng.gen_range(minimum_integer, maximum_integer);
    let random_number: i64 = (random_seed % (maximum_integer - minimum_integer)) + minimum_integer;
    let remainder = random_number % multiple_of_integer;

    return (random_number - remainder).to_string();
}

/**
 * Gets a number using an iteration with the following caveats:
 * - if enums exist only use those
 * - if default and/or examples exist, use these before generating any random numbers
 */
fn get_number(json: &JsonValue) -> String {
    let mut count: i64 = 0;
    let iteration_number: json::number::Number = JsonValue::as_number(&json["iteration"]).unwrap().into();
    let iteration_integer: i64 = convert::convert_f64_to_i64(iteration_number.into());

    if check::for_array_property(json, "enum") {
        let enums: &JsonValue = &json["schema"]["enum"];
        let selected_item = iteration_integer % *&enums.len() as i64;

        return enums[selected_item as usize].to_string();
    }
    
    if check::for_number_property(json, "default") {
        if iteration_integer == 1 {
            let default_number: json::number::Number = JsonValue::as_number(&json["schema"]["default"]).unwrap().into();

            return convert::convert_f64_to_i64(default_number.into()).to_string();
        }
        
        count = count + 1;
    }

    if check::for_array_property(json, "examples") {
        let examples: &JsonValue = &json["schema"]["examples"];
        
        for i in 0..=&examples.len() - 1 {
            count = count + 1;

            if count == iteration_integer {
                return examples[i].to_string();
            }
        }
    }

    return get_random_number(json);
}

/**
 * Create a permutation of a number
 */
pub fn permutate_number(json: &JsonValue) -> String {
    return get_number(json);
}