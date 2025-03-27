CREATE TABLE estimates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crop_name VARCHAR(255) NOT NULL,
    area FLOAT NOT NULL,
    yield FLOAT NOT NULL,
    total_estimate FLOAT NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL
);
