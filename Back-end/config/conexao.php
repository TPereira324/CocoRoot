<?php

namespace App\Config;

use PDO;
use PDOException;

class Conexao
{
    private static ?PDO $instancia = null;

    public static function getConexao(): PDO
    {
        if (self::$instancia === null) {
            $host = getenv("MYSQL_HOST") ?: "127.0.0.1";
            $db   = "coco_db";
            $user = "root";
            $pass = "root";
            $charset = 'utf8mb4';

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                $ports = [];
                $envPort = getenv("MYSQL_PORT");
                if ($envPort !== false && $envPort !== "") {
                    $ports[] = (int)$envPort;
                }
                $ports[] = 3306;
                $ports[] = 8889;
                $ports = array_values(array_unique(array_filter($ports, fn($p) => is_int($p) && $p > 0)));

                $lastException = null;
                foreach ($ports as $port) {
                    try {
                        $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
                        self::$instancia = new PDO($dsn, $user, $pass, $options);
                        $lastException = null;
                        break;
                    } catch (PDOException $e) {
                        $lastException = $e;
                    }
                }
                if ($lastException) {
                    throw $lastException;
                }
            } catch (PDOException $e) {
                throw new PDOException($e->getMessage(), (int)$e->getCode());
            }
        }

        return self::$instancia;
    }
}
