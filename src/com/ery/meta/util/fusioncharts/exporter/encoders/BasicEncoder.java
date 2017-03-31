package com.ery.meta.util.fusioncharts.exporter.encoders;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Iterator;
import javax.imageio.*;
import javax.imageio.stream.FileImageOutputStream;
import javax.imageio.stream.ImageOutputStream;
import javax.servlet.jsp.JspWriter;



public class BasicEncoder
    implements Encoder
{

    String defaultFormat;

    public BasicEncoder()
    {
        defaultFormat = "JPEG";
    }

    public void encode(BufferedImage bufferedImage, OutputStream outputStream, float quality)
        throws Throwable
    {
        encode(bufferedImage, outputStream, quality, defaultFormat);
    }

    public void encode(BufferedImage bufferedImage, OutputStream outputStream)
        throws Throwable
    {
        encode(bufferedImage, outputStream, 1.0F);
    }

    @SuppressWarnings({ "rawtypes" })
    public void encode(BufferedImage bufferedImage, OutputStream outputStream, float quality, String format)
        throws Throwable
    {
        ImageOutputStream ios = null;
        try
        {
            Iterator writers = ImageIO.getImageWritersByFormatName(format);
            ImageWriter writer = (ImageWriter)writers.next();
            javax.imageio.ImageWriteParam iwp = writer.getDefaultWriteParam();
            ios = ImageIO.createImageOutputStream(outputStream);
            writer.setOutput(ios);
            writer.write(null, new IIOImage(bufferedImage, null, null), iwp);
            ios.close();
        }
        catch(IllegalArgumentException e)
        {
            if(ios != null)
                ios.close();
            throw new Throwable();
        }
        catch(IOException e)
        {
            if(ios != null)
                ios.close();
            throw new Throwable();
        }
    }

    @SuppressWarnings({ "rawtypes" })
    public void encode(BufferedImage bufferedImage, JspWriter out, float quality, String format)
        throws Throwable
    {
        ImageOutputStream ios = null;
        try
        {
            Iterator writers = ImageIO.getImageWritersByFormatName(format);
            ImageWriter writer = (ImageWriter)writers.next();
            javax.imageio.ImageWriteParam iwp = writer.getDefaultWriteParam();
            ios = ImageIO.createImageOutputStream(out);
            writer.setOutput(ios);
            writer.write(null, new IIOImage(bufferedImage, null, null), iwp);
            ios.close();
        }
        catch(IllegalArgumentException e)
        {
            if(ios != null)
                ios.close();
            throw new Throwable();
        }
        catch(IOException e)
        {
            if(ios != null)
                ios.close();
            throw new Throwable();
        }
    }

    public void encode(BufferedImage bufferedImage, FileImageOutputStream fileImageOutputStream, float quality)
        throws Throwable
    {
        encode(bufferedImage, fileImageOutputStream, quality, defaultFormat);
    }

    public void encode(BufferedImage bufferedImage, FileImageOutputStream fileImageOutputStream)
        throws Throwable
    {
        encode(bufferedImage, fileImageOutputStream, 1.0F);
    }

    @SuppressWarnings({ "rawtypes" })
    public void encode(BufferedImage bufferedImage, FileImageOutputStream fileImageOutputStream, float quality, String format)
        throws Throwable
    {
        Iterator writers = ImageIO.getImageWritersByFormatName(format);
        ImageWriter writer = (ImageWriter)writers.next();
        javax.imageio.ImageWriteParam iwp = writer.getDefaultWriteParam();
        writer.setOutput(fileImageOutputStream);
        writer.write(null, new IIOImage(bufferedImage, null, null), iwp);
        fileImageOutputStream.close();
    }
}
