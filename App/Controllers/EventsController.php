<?php
/**
 * Created by Antoine Jackson
 * User: Antoine Jackson
 * Date: 10/16/13
 * Time: 11:04 PM
 */

namespace Calendar;

class EventsController extends \Controller
{
    public function before_filter()
    {
        \User::restrict();
    }


    public function index()
    {
        $em = \Model::getEntityManager();
        $qb = $em->createQueryBuilder();

        $qb->select('e')->from('\Calendar\Event', 'e')->where('e.owner = :user')
            ->setParameter('user', \User::current_user());

        $results = $qb->getQuery()->getResult();

        $response = array();
        foreach ($results as $result)
        {
            $response[] = $result->toArray();
        }

        $this->return_json($response);
    }

    private function createOrUpdate($data)
    {
        if (isset($data["id"]))
            $event = Event::find($data["id"]);
        else
            $event = null;

        if (!is_object($event))
        {
            $event = new Event();
        }

        $event->setOwner(\User::current_user());

        $event->setName($data["name"]);

        $event->setDescription($data["description"]);

        $start = \DateTime::createFromFormat(\DateTime::ISO8601, $data["start"]);
        $event->setStart($start);

        $stop = \DateTime::createFromFormat(\DateTime::ISO8601, $data["end"]);
        $event->setEnd($stop);

        $event->save();

        return $event->toArray();
    }

    public function create($data = array())
    {
        $data = $this->getRequestData();
        $this->return_json($this->createOrUpdate($data));
    }

    public function update($data = array())
    {
        $data = $this->getRequestData();
        if (isset($data["id"]))
            $event = Event::find($data["id"]);
        else
            $event = null;
        if (is_object($event))
        {
            if ($event->getOwner() == \User::current_user())
            {
                $this->return_json($this->createOrUpdate($data));
            }
            else
            {
                $this->json_error("This event does not exist", 404);
            }
        }
        else
        {
            $this->json_error("This event does not exist", 404);
        }
    }


    public function destroy($data = array())
    {
        $data = $this->getRequestData();
        $event = Event::find($data["id"]);
        if (is_object($event))
        {
            if ($event->getOwner() == \User::current_user())
            {
                $event->delete();
            }
            else
            {
                $this->json_error("This event does not exist", 404);
            }
        }
        else
        {
            $this->json_error("This event does not exist", 404);
        }
    }

}