--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

-- Started on 2024-10-22 14:11:46

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS lillie;
--
-- TOC entry 4791 (class 1262 OID 16412)
-- Name: lillie; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE lillie ENCODING = 'UTF8';


ALTER DATABASE lillie OWNER TO postgres;

\connect lillie

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 216 (class 1259 OID 16418)
-- Name: config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.config (
    standard_channel_id character varying(20),
    standard_emoji character varying(100),
    standard_threshold integer DEFAULT 3 NOT NULL,
    guild_id character varying(20) NOT NULL,
    gold_channel_id character varying(20),
    gold_emoji character varying(100),
    gold_threshold integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.config OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16413)
-- Name: stars; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stars (
    author_id character varying(20) NOT NULL,
    board_channel_id character varying(20) NOT NULL,
    board_message_id character varying(20) NOT NULL,
    channel_id character varying(20) NOT NULL,
    guild_id character varying(20) NOT NULL,
    message_id character varying(20) NOT NULL,
    premium_score integer DEFAULT 0 NOT NULL,
    score integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.stars OWNER TO postgres;

--
-- TOC entry 4642 (class 2606 OID 16424)
-- Name: config config_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.config
    ADD CONSTRAINT config_pk PRIMARY KEY (guild_id);


--
-- TOC entry 4792 (class 0 OID 0)
-- Dependencies: 216
-- Name: TABLE config; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.config TO lillie;


--
-- TOC entry 4793 (class 0 OID 0)
-- Dependencies: 215
-- Name: TABLE stars; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.stars TO lillie;


-- Completed on 2024-10-22 14:11:46

--
-- PostgreSQL database dump complete
--

