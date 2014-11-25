<?php

namespace srms\sof\controllers;

class DBController
{
    const DB_HOST = 'mongodb://localhost:27017';
    const DB_NAME = 'sof-srms';

    private static $instance = null;
    private $mongo = null;
    private $db = null;

    /**
     * @return null|DBController
     */
    public static function get()
    {
        if(self::$instance == null)
        {
            self::$instance = new DBController();
        }
        return self::$instance;
    }

    /**
     * @return \MongoDB|null
     */
    public static function db()
    {
        if(self::$instance == null)
        {
            self::$instance = new DBController();
        }
        return self::$instance->db;
    }

    public function index($collection)
    {
        $cursor = $this->db->counters->find(["_id" => $collection]);
        if(!$cursor->hasNext())
        {
            DBController::db()->counters->insert(["_id" => $collection, "value" => 0]);
            return 0;
        }
        return  $cursor->getNext()["value"];
    }

    private function __construct()
    {
        $this->mongo = new \MongoClient(self::DB_HOST);
        $this->db = $this->mongo->{self::DB_NAME};
    }

    private function __clone()
    {
    }
} 