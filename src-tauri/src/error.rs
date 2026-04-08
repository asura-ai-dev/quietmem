use thiserror::Error;

/// アプリ全体で共有するエラー型。
///
/// Phase 1B で `rusqlite::Error` を包む `Db` バリアントを追加した。
/// Phase 1C (task-1C02 以降) で commands 層経由で全バリアントが実用される。
#[derive(Debug, Error)]
pub enum AppError {
    #[error("not found: {0}")]
    NotFound(String),

    #[error("invalid input: {0}")]
    InvalidInput(String),

    #[error("io error: {0}")]
    Io(#[from] std::io::Error),

    #[error("db error: {0}")]
    Db(#[from] rusqlite::Error),

    #[error("internal: {0}")]
    Internal(String),
}

impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        #[derive(serde::Serialize)]
        struct Payload<'a> {
            code: &'a str,
            message: String,
        }

        let code = match self {
            AppError::NotFound(_) => "not_found",
            AppError::InvalidInput(_) => "invalid_input",
            AppError::Io(_) => "io_error",
            AppError::Db(_) => "db_error",
            AppError::Internal(_) => "internal",
        };

        Payload {
            code,
            message: self.to_string(),
        }
        .serialize(serializer)
    }
}

/// アプリ共通の `Result` 型エイリアス。
pub type AppResult<T> = Result<T, AppError>;
