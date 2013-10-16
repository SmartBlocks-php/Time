<?php
/**
 * Date: 12/03/2013
 * Time: 11:28
 * This is the model class called File
 */
namespace Calendar;
/**
 * @Entity @Table(name="calendar_events")
 */
class Event extends \Model
{
    /**
     * @Id @GeneratedValue(strategy="AUTO") @Column(type="integer")
     */
    public $id;

    /**
     * @Column(type="string")
     */
    private $name;

    /**
     * @Column(type="text")
     */
    private $description;

    /**
     * @Column(type="datetime")
     */
    private $start;

    /**
     * @Column(type="datetime")
     */
    private $end;

    /**
     * @ManyToOne(targetEntity="\User")
     */
    private $owner;


    public function __construct()
    {

    }

    public function getId()
    {
        return $this->id;
    }

    public function setName($name)
    {
        $this->name = $name;
    }

    public function getName()
    {
        return $this->name;
    }

    public function setDescription($description)
    {
        $this->description = $description;
    }

    public function getDescription()
    {
        return $this->description;
    }

    public function setEnd($end)
    {
        $this->end = $end;
    }

    public function getEnd()
    {
        return $this->end;
    }

    public function setOwner($owner)
    {
        $this->owner = $owner;
    }

    public function getOwner()
    {
        return $this->owner;
    }

    public function setStart($start)
    {
        $this->start = $start;
    }

    public function getStart()
    {
        return $this->start;
    }


    public function toArray($reach_subfiles = false)
    {
        return array(
            "id" => $this->id,
            "name" => $this->name,
            "description" => $this->description,
            "owner" => $this->getOwner() != null ? $this->getOwner()->toArray() : null,
            "start" => $this->getStart()->format(\DateTime::ISO8601),
            "stop" => $this->getStart()->format(\DateTime::ISO8601),
        );
    }
}